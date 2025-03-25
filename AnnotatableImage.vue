<template>
    <div class="image-container" ref="container">
      <!-- Image to be displayed -->
      <img :src="fields.image.value" :width=imageWidth :height=imageHeight oncontextmenu="return false;" class="image" alt="image" @mousedown="rectangleStart" @mouseup="rectangleEnd" @mousemove="handleMouseMove" draggable="false" @mouseclick="handleClick" />

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
          <li v-for="(rect, index) in fields.rectangles.value" :key="index">
            Rectangle {{ index + 1 }}: X: {{ rect.x }}, Y: {{ rect.y }}, Width: {{ rect.width }}, Height: {{ rect.height }}
          </li>
        </ul>
      </div>
    </div>
</template>

<script lang="ts">

const container: Ref<HTMLElement> = ref(null); // Root element is used to fire events

const pinMessageHandlerStub = `
def handle_pin(state, payload):
	state["pinned_message_id"] = payload`;

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
            },
            rectangles: {
              name: "Rectangles",
              type: FieldType.Object,
            }
		},

	  events: {
	  	"rectangles-updated": {
	  		desc: "Emitted when the pin button is clicked.",
	  		stub: pinMessageHandlerStub,
	  	},
	  },

		// Preview field is used in the Component Tree

		previewField: "text",
	},
};
</script>

<script setup lang="ts">
import { FieldType } from "@/writerTypes";
import injectionKeys from "@/injectionKeys";
import { watch, inject, onMounted, computed, reactive, ref, Ref } from "vue";
/*
The values for the fields defined earlier in the custom option
will be available using the evaluatedFields injection symbol.
*/

const fields = inject(injectionKeys.evaluatedFields);
const startX = ref(null);
const startY = ref(null);
const dragStartX = ref(null);
const dragStartY = ref(null);
const isDragging = ref(false);
const isDrawing = ref(false);
const isMouseDown = ref(false);
const isMouseUp = ref(false);
const selectedRectangle = ref(null);
const highlightedRectangle = ref(null);

var imageWidth = ref(800);
var imageHeight = ref(600);

const drawRectangles = () => {
    const canvas = container.value.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    rectangles.forEach((rect) => {
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
};

onMounted(() => {
  rectangles.values = fields.rectangles.value;
  setWidthAndHeight();
  drawRectangles();
});

function setWidthAndHeight() {
  const img = new Image();
  img.src = fields.image.value;
  img.onload = () => {
    imageWidth.value = img.width;
    imageHeight.value = img.height;
    drawRectangles();
  };
}

//const imageWidth = computed(() => {
//    const img = new Image();
//    img.src = fields.image.value;
//    return img.width;
//});
//
//const imageHeight = computed(() => {
//    const img = new Image();
//    img.src = fields.image.value;
//    return img.height;
//});

const rectangles = reactive<{ x: number; y: number; width: number; height: number }[]>([]);

const rectangleStart = (event: MouseEvent) => {
  isMouseDown.value = true;
    const rect = container.value.getBoundingClientRect();
    startX.value = event.clientX - rect.left;
    startY.value = event.clientY - rect.top;
};

window.addEventListener("keydown", (event) => {
    if (event.key === "d" && highlightedRectangle.value) {
        const index = rectangles.indexOf(highlightedRectangle.value);
        rectangles.splice(index, 1);
        highlightedRectangle.value = null;
    }
});

const rectangleEnd = (event: MouseEvent) => {
  isMouseDown.value = true;
  if (! isDrawing.value && !isDragging.value) {
    startX.value = null;
    startY.value = null;
    return;
  }
  if (isDrawing.value) {
    const rect = container.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // End drawing and store the rectangle
    var width = x - startX.value;
    var height = y - startY.value;
    var xx = startX.value;
    var yy = startY.value;
    if (width < 0) {
      xx = xx + width;
      width = -width;
    }
    if (height < 0) {
      yy = yy + height;
      height = -height;
    }
    if (!(width === 0 || height === 0)) {
      const newRect = {
          x: xx,
          y: yy,
          width: (width),
          height: (height),
      };
      rectangles.push(newRect);
      }
  }

    emitRectanglesUpdate(rectangles);

    isDragging.value = false;
    isDrawing.value = false;
    startX.value = null;
    startY.value = null;
};

const handleMouseMove = (event: MouseEvent) => {
    if (startX.value && isMouseDown.value && event.buttons === 1) {
        isDrawing.value = true;
    } else if (startX.value && isMouseDown.value && event.buttons === 2) {
        isDragging.value = true;
        if (highlightedRectangle.value) {
          dragStartX.value = +("" + highlightedRectangle.value.x);
          dragStartY.value = +("" + highlightedRectangle.value.y);
        }
    }
    if (isDrawing.value) {
      const rect = container.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const width = x - startX.value;
      const height = y - startY.value;

      // draw this rectangle
      const canvas = container.value.querySelector("canvas");
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
    
      rectangles.forEach((rect) => {
          ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      });

      ctx.strokeRect(startX.value, startY.value, width, height);
    } else if (isDragging.value) {
      const rect = container.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      highlightedRectangle.value = rectangles.find((rect) => {
        return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
      });

      if (highlightedRectangle.value) {
        highlightedRectangle.value.x += (x - startX.value);
        highlightedRectangle.value.y += (y - startY.value);
        startX.value = x;
        startY.value = y;
        const canvas = container.value.querySelector("canvas");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        rectangles.forEach((rect) => {
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        });

        ctx.lineWidth = 5;
        [highlightedRectangle.value].forEach((rect) => {
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        });
      }

    } else {
      // make hovered rectangle bold
      const rect = container.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      highlightedRectangle.value = rectangles.find((rect) => {
        return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
      });

      const canvas = container.value.querySelector("canvas");
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;

      rectangles.forEach((rect) => {
          ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      });

      if (!highlightedRectangle.value) {
        return;
      }

      ctx.lineWidth = 5;
      [highlightedRectangle.value].forEach((rect) => {
          ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      });

    }
};

const emitRectanglesUpdate = (rectangles: any) => {
  const event = new CustomEvent('rectangles-updated', {
    detail: {payload: rectangles},
  });
  if (container.value) {
    container.value.dispatchEvent(event);
  }
};

watch(rectangles, () => {
  drawRectangles();
});

watch(() => fields.rectangles.value, () => {
  rectangles.length = 0;
  rectangles.push(...fields.rectangles.value);
  drawRectangles();
}, {deep: true});

watch(() => fields.image.value, () => {
  setWidthAndHeight();
  drawRectangles();
}, {deep: true});

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
