import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import numpy as np


def plot_segments(image, detections, color="yellow"):
    img_h, img_w = image.shape[:2]

    fig, ax = plt.subplots(figsize=(img_w / 100, img_h / 100), dpi=100)
    try:
        fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
        ax.imshow(image)
        ax.axis('off')

        for det in detections:
            class_name = det["class_name"].upper()
            seg_points = det["segmentation"]

            polygon_points = [(seg_points[i] * img_w, seg_points[i + 1] * img_h)
                              for i in range(0, len(seg_points) - 1, 2)]
            if not polygon_points:
                continue

            polygon = Polygon(polygon_points, closed=True,
                              facecolor='lightblue', linewidth=0.2, alpha=0.5)

            ax.add_patch(polygon)

            x_min, y_min = polygon_points[0]
            ax.text(x_min, max(10, y_min - 5), class_name, color=color,
                    fontsize=8, bbox=dict(facecolor='black', alpha=0.3))

        fig.canvas.draw()
        rgba_buffer = np.asarray(fig.canvas.buffer_rgba(), dtype=np.uint8)
        img_array = rgba_buffer[:, :, :3].copy()
        return img_array
    finally:
        plt.close(fig)
