// Import the templates

import type { TemplateMap } from "@/writerTypes";
import BubbleMessage from "./BubbleMessage.vue";
import BubbleMessageAdvanced from "./BubbleMessageAdvanced.vue";
import AnnotatableImage from "./AnnotatableImage.vue";

// Export an object with the ids and the templates as default

const CUSTOM_COMPONENTS: TemplateMap = {
	bubblemessage: BubbleMessage,
	bubblemessageadvanced: BubbleMessageAdvanced,
	annotatableimage: AnnotatableImage,
};

export default CUSTOM_COMPONENTS;
