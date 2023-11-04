import { Ref, ref, watch, onUnmounted } from "vue";

export function useTooltip(
	elRef: Ref<HTMLElement | { $el: HTMLElement } | null | undefined>,
	onShow: (showing: Ref<boolean>) => void,
	delay = 300,
): void {
	let isHovering = false;

	let timeoutId: number;

	let changeShowingState: (() => void) | null;

	const open = () => {
		close();
		if (!isHovering) return;
		if (elRef.value == null) return;
		const el = elRef.value instanceof Element ? elRef.value : elRef.value.$el;
		if (!document.body.contains(el)) return; // openしようとしたときに既に元要素がDOMから消えている場合があるため

		const showing = ref(true);
		onShow(showing);
		changeShowingState = () => {
			showing.value = false;
		};
	};

	const close = () => {
		if (changeShowingState != null) {
			changeShowingState();
			changeShowingState = null;
		}
	};

	const onMouseover = () => {
		if (isHovering) return;
		isHovering = true;
		timeoutId = window.setTimeout(open, delay);
	};

	const onMouseleave = () => {
		if (!isHovering) return;
		isHovering = false;
		window.clearTimeout(timeoutId);
		close();
	};

	const stop = watch(
		elRef,
		() => {
			if (elRef.value) {
				stop();
				const el =
					elRef.value instanceof Element ? elRef.value : elRef.value.$el;
				el.addEventListener("mouseover", onMouseover, { passive: true });
				el.addEventListener("mouseleave", onMouseleave, { passive: true });
				el.addEventListener("click", close, { passive: true });
			}
		},
		{
			immediate: true,
			flush: "post",
		},
	);

	onUnmounted(() => {
		close();
	});
}
