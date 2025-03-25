<template>
	<div class="AnnotatableImage">
		<div class="triangle"></div>
		<div class="message">
			{{ fields.text.value }}
		</div>
	</div>
    <div class="image-container" ref="container">
      <!-- Image to be displayed -->
      <img :src="fields.image.value" class="image" alt="image" @mousedown="rectangleStart" @mouseup="rectangleEnd" draggable="false" />

      <!-- Canvas for drawing rectangles -->
      <canvas
        ref="canvas"
        :width=imageWidth
        :height=imageHeight
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
export default {
	writer: {
		name: "Annotatable Image",
		description: "Shows a message in the shape of a speech bubble.",
		category: "Content",

		// Fields will be editable via Writer Framework Builder

		fields: {
            image: {
                name: "Image",
                type: FieldType.Text,
            }
		},

		// Preview field is used in the Component Tree

		previewField: "text",
	},
};
</script>

<script setup lang="ts">
import { FieldType } from "@/writerTypes";
import injectionKeys from "@/injectionKeys";
import { inject, onMounted, computed, reactive, ref, Ref } from "vue";
/*
The values for the fields defined earlier in the custom option
will be available using the evaluatedFields injection symbol.
*/

const fields = inject(injectionKeys.evaluatedFields);
const container: Ref<HTMLElement> = ref(null); // Root element is used to fire events
const startX = ref(0);
const startY = ref(0);

onMounted(() => {
    });

const imageWidth = computed(() => {
    const img = new Image();
    img.src = fields.image.value;
    return img.width;
});

const imageHeight = computed(() => {
    const img = new Image();
    img.src = fields.image.value;
    return img.height;
});


const rectangles = ref([]);

const rectangleStart = (event: MouseEvent) => {
    const rect = container.value.getBoundingClientRect();
    startX.value = event.clientX - rect.left;
    startY.value = event.clientY - rect.top;
};

const rectangleEnd = (event: MouseEvent) => {
    const rect = container.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // End drawing and store the rectangle
    const width = x - startX.value;
    const height = y - startY.value;
    const newRect = {
        x: startX.value,
        y: startY.value,
        width: Math.abs(width),
        height: Math.abs(height),
    };

    rectangles.value.push(newRect);
    console.log(rectangles);
};

</script>

<style scoped>
.BubbleMessage {
	width: fit-content;
	max-width: 100%;
	display: flex;
	position: relative;
	background: white;
}

.triangle {
	flex: 0 0 auto;
	border-left: 12px solid white;
	border-top: 12px solid #f0f0f0;
}

.message {
	flex: 1 0 auto;
	background: #f0f0f0;
	border-radius: 0 12px 12px 12px;
	padding: 16px;
}

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
