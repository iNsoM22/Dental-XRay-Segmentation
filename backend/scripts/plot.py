import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import numpy as np


def plot_segments(image, detections, color="yellow"):
    img_h, img_w = image.shape[:2]

    fig, ax = plt.subplots(figsize=(img_w / 100, img_h / 100), dpi=100)
    ax.imshow(image)
    ax.axis('off')

    for det in detections:
        class_name = det["class_name"].upper()
        seg_points = det["segmentation"]

        polygon_points = [(seg_points[i] * img_w, seg_points[i + 1] * img_h)
                          for i in range(0, len(seg_points) - 1, 2)]

        polygon = Polygon(polygon_points, closed=True,
                          facecolor='lightblue', linewidth=0.2, alpha=0.5)

        ax.add_patch(polygon)

        x_min, y_min = polygon_points[0]
        ax.text(x_min, y_min - 5, class_name, color=color,
                fontsize=8, bbox=dict(facecolor='black', alpha=0.3))

    fig.canvas.draw()
    img_array = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
    img_array = img_array.reshape(fig.canvas.get_width_height()[::-1] + (3,))
    plt.close(fig)

    return img_array
