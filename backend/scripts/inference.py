from utils.general import (
    check_img_size,
    non_max_suppression,
    scale_boxes,
    scale_segments,
)
from utils.augmentations import letterbox
from utils.segment.general import masks2segments, process_mask
from utils.torch_utils import smart_inference_mode
import torch
import numpy as np


def process_image(im0, img_size=640, stride=32, auto=True, transforms=None):
    if transforms:
        im = transforms(im0)
    else:
        im = letterbox(im0, img_size, stride=stride, auto=auto)[0]
        im = im.transpose((2, 0, 1))[::-1]
        im = np.ascontiguousarray(im)

    return im, im0


@smart_inference_mode()
def inference(
    model,
    device,
    image,
    imgsz=(640, 640),
    conf_thres=0.25,
    iou_thres=0.45,
    max_det=1000,
    classes=None,
    agnostic_nms=False,
    retina_masks=False,
):
    stride, names, pt = model.stride, model.names, model.pt
    imgsz = check_img_size(imgsz, s=stride)

    dataset = [process_image(image, img_size=imgsz,
                             stride=stride, auto=pt)]

    predictions = []

    for im, im0s in dataset:
        im = torch.from_numpy(im).to(device)
        im = im.half() if model.fp16 else im.float()
        im /= 255
        if len(im.shape) == 3:
            im = im[None]

        pred, proto = model(im)[:2]
        pred = non_max_suppression(
            pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det, nm=32)

        for i, det in enumerate(pred):
            im0 = im0s.copy()

            if len(det):
                masks = process_mask(
                    proto[i], det[:, 6:], det[:, :4], im.shape[2:], upsample=True)
                det[:, :4] = scale_boxes(
                    im.shape[2:], det[:, :4], im0.shape).round()

                segments = [
                    scale_segments(
                        im0.shape if retina_masks else im.shape[2:], x, im0.shape, normalize=True)
                    for x in reversed(masks2segments(masks))
                ]

                for j, (*xyxy, conf, cls) in enumerate(reversed(det[:, :6])):
                    seg = segments[j].reshape(-1)
                    predictions.append({
                        "class_name": names[cls.item()],
                        "confidence": conf.item(),
                        "bbox": [int(i) for i in xyxy],
                        "segmentation": seg.tolist()
                    })

    return predictions
