<!-- Code adapted under MIT from https://github.com/liberu-ui/pull-to-refresh - Copyright (c) 2016 LinBin -->

<template>
	<div class="pull-down-container">
		<div class="pull-down-header" :style="{'height': pullDown.height + 'px'}">
			<div class="pull-down-content" :style="pullDownContentStyle">
				<i class="pull-down-icon ph-bold ph-seal-warning" v-if="pullDown.status === -1"/>
				<i class="pull-down-icon ph-bold ph-arrow-down" v-else-if="pullDown.status !== 2"/>
			</div>
		</div>
		<slot/>
	</div>
</template>

<script>
// status of pull down
const STATUS_ERROR = -1;
const STATUS_START = 0;
const STATUS_READY = 1;
const STATUS_REFRESH = 2;
// labels of pull down
const ANIMATION = 'height .2s ease';

export default {
	props: {
		onRefresh: {
			type: Function,
			required: true,
		},
		config: {
			type: Object,
			default() {
				return {
					pullDownHeight: 60,
				};
			},
		},
	},
	data() {
		return {
			pullDown: {
				status: 0,
				height: 0,
				msg: '',
			},
			canPull: false,
		};
	},
	computed: {
		pullDownContentStyle() {
			return {
				bottom: `${(this.config.pullDownHeight - 40) / 2}px`,
			};
		},
	},
	mounted() {
		this.$nextTick(() => {
			const el = this.$el;
			const pullDownHeader = el.querySelector('.pull-down-header');
			const icon = pullDownHeader.querySelector('.pull-down-icon');
			// set default pullDownHeight
			this.config.pullDownHeight = this.config.pullDownHeight || 60;
			/**
			 * reset the status of pull down
			 * @param {Object} pullDown the pull down
			 * @param {Boolean} withAnimation whether add animation when pull up
			 */
			const resetPullDown = (pullDown, withAnimation = false) => {
				if (withAnimation) {
					pullDownHeader.style.transition = ANIMATION;
				}
				pullDown.height = 0;
				pullDown.status = STATUS_START;
			};
			// store of touch position, include start position and distance
			const touchPosition = {
				start: 0,
				distance: 0,
			};

			// @see https://www.chromestatus.com/feature/5745543795965952
			// Test via a getter in the options object to see if the passive property is accessed
			let supportsPassive = false;
			try {
				const opts = Object.defineProperty({}, 'passive', {
					get() {
						supportsPassive = true;
					},
				});
				/* global window */
				window.addEventListener('test', null, opts);
			} catch (e) {
				// do nothing
			}

			// bind touchstart event to store start position of touch
			el.addEventListener('touchstart', e => {
				this.canPull = el.scrollTop === 0;
				touchPosition.start = e.touches.item(0).pageY;
			}, supportsPassive ? {passive: true} : false);

			/**
			 * bind touchmove event, do the following:
			 * first, update the height of pull down
			 * finally, update the status of pull down based on the distance
			 */
			el.addEventListener('touchmove', e => {
				if (!this.canPull) {
					return;
				}

				let distance = e.touches.item(0).pageY - touchPosition.start;
				// limit the height of pull down to pullDownHeight
				distance = Math.min(distance, this.config.pullDownHeight);
				// prevent native scroll
				if (distance > 0) {
					el.style.overflow = 'hidden';
				}
				// update touchPosition and the height of pull down
				touchPosition.distance = distance;
				this.pullDown.height = distance;
				/**
				 * if distance is bigger than the height of pull down
				 * set the status of pull down to STATUS_READY
				 */
				if (distance >= this.config.pullDownHeight) {
					this.pullDown.status = STATUS_READY;
					icon.style.transform = 'rotate(180deg)';
				} else {
					/**
					 * else set the status of pull down to STATUS_START
					 */
					this.pullDown.status = STATUS_START;
					icon.style.transform = `rotate(0deg)`;
				}
			}, supportsPassive ? {passive: true} : false);

			// bind touchend event
			el.addEventListener('touchend', () => {
				this.canPull = false;
				el.style.overflowY = 'auto';
				pullDownHeader.style.transition = ANIMATION;
				// reset icon rotate
				icon.style.transform = '';
				// if distance is at threshold
				if (touchPosition.distance - el.scrollTop >= this.config.pullDownHeight) {
					el.scrollTop = 0;
					this.pullDown.height = this.config.pullDownHeight;
					this.pullDown.status = STATUS_REFRESH;
					// trigger refresh callback
					if (this.onRefresh && typeof this.onRefresh === 'function') {
						const res = this.onRefresh();
						// if onRefresh return promise
						if (res && res.then && typeof res.then === 'function') {
							res.then(() => {
								resetPullDown(this.pullDown, true);
							}, () => {
								// hide the pull down after 1 second
								this.pullDown.status = STATUS_ERROR;
								setTimeout(() => {
									resetPullDown(this.pullDown, true);
								}, 1000);
							});
						} else {
							resetPullDown(this.pullDown);
						}
					} else {
						resetPullDown(this.pullDown);
						console.warn('please use :on-refresh to pass onRefresh callback');
					}
				} else {
					resetPullDown(this.pullDown);
				}
				// reset touchPosition
				touchPosition.distance = 0;
				touchPosition.start = 0;
			});
			// remove transition when transitionend
			pullDownHeader.addEventListener('transitionend', () => {
				pullDownHeader.style.transition = '';
			});
			pullDownHeader.addEventListener('webkitTransitionEnd', () => {
				pullDownHeader.style.transition = '';
			});
		});
	},
};
</script>

<style lang="scss" scoped>
.pull-down-container {
	height: 100%;
	max-height: 100%;
	overflow-y: auto;
}

.pull-down-header {
	width: 100%;
	height: 0;
	overflow: hidden;
	position: relative;
}

.pull-down-content {
	position: absolute;
	margin-bottom: 12.5px;
	left: 50%;
	transform: translateX(-50%);
	color: #d5d5d5;
}

.pull-down-icon {
	float: left;
	height: 25px;
	width: 25px;
	font-size: 25px;
	transition: transform 0.3s ease;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
