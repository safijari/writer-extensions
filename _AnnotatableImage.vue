<template>
  <div class="image-container" ref="container">
    <!-- Image to be displayed -->
    <img :src="imageSrc" class="image" alt="image" @click="onImageClick" />

    <!-- Canvas for drawing rectangles -->
    <canvas
      ref="canvas"
      :width="imageWidth"
      :height="imageHeight"
      class="drawing-canvas"
    ></canvas>

    <div class="rectangle-info">
      <!-- Display the list of rectangles -->
      <ul>
        <li v-for="(rect, index) in rectangles" :key="index">
          Rectangle {{ index + 1 }}: X: {{ rect.x }}, Y: {{ rect.y }}, Width: {{ rect.width }}, Height: {{ rect.height }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';

export default defineComponent({
  name: 'AnnotatableImage',
  props: {
    imageSrc: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const container = ref<HTMLElement | null>(null);
    const canvas = ref<HTMLCanvasElement | null>(null);

    // List of rectangles that are drawn
    const rectangles = reactive<{ x: number; y: number; width: number; height: number }[]>([]);

    // To track the current drawing state
    let isDrawing = ref(false);
    let startX = ref(0);
    let startY = ref(0);

    // Dynamically set the image width and height
    const imageWidth = ref(0);
    const imageHeight = ref(0);

    // Set the image dimensions when the image is loaded
    onMounted(() => {
      const img = new Image();
      img.src = props.imageSrc;
      img.onload = () => {
        imageWidth.value = img.width;
        imageHeight.value = img.height;
        if (canvas.value) {
          canvas.value.width = img.width;
          canvas.value.height = img.height;
        }
      };
    });

    // Start drawing on canvas
    const onImageClick = (event: MouseEvent) => {
      if (!canvas.value || !container.value) return;

      const rect = container.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!isDrawing.value) {
        // Start drawing a new rectangle
        startX.value = x;
        startY.value = y;
        isDrawing.value = true;
      } else {
        // End drawing and store the rectangle
        const width = x - startX.value;
        const height = y - startY.value;
        const newRect = {
          x: startX.value,
          y: startY.value,
          width: Math.abs(width),
          height: Math.abs(height),
        };

        rectangles.push(newRect);

        // Emit event with all rectangles data
        emitRectanglesUpdate(rectangles);

        isDrawing.value = false;
      }
    };

    // Emit event to notify parent of new rectangles data
    const emitRectanglesUpdate = (rectangles: any) => {
      const event = new CustomEvent('rectangles-updated', {
        detail: rectangles,
      });
      if (container.value) {
        container.value.dispatchEvent(event);
      }
    };

    return {
      canvas,
      rectangles,
      onImageClick,
      imageWidth,
      imageHeight,
    };
  },
});
</script>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
}

.image {
  width: 100%;
  height: auto;
  display: block;
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none; /* Allow clicks on the image underneath */
  z-index: 1;
}

.rectangle-info {
  margin-top: 10px;
}

.rectangle-info ul {
  padding-left: 0;
}

.rectangle-info li {
  list-style: none;
}

.rectangle-info li::before {
  content: "► ";
}

.rectangle-info li {
  font-size: 12px;
  margin-bottom: 5px;
}
</style>