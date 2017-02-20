<mk-ui-notification>
	<p>{ opts.message }</p>
	<style>
		:scope
			display block
			position fixed
			z-index 10000
			top -64px
			left 0
			right 0
			margin 0 auto
			width 500px
			color rgba(#000, 0.6)
			background rgba(#fff, 0.9)
			border-radius 0 0 8px 8px
			box-shadow 0 2px 4px rgba(#000, 0.2)

			> p
				margin 0
				line-height 64px
				text-align center

	</style>
	<script>
		this.on('mount', () => {
			Velocity this.root, {
				top: '0px' 
			} {
				duration: 500ms
				easing: 'ease-out' 
			}

			setTimeout =>
				Velocity this.root, {
					top: '-64px' 
				} {
					duration: 500ms
					easing: 'ease-out' 
					complete: =>
						this.unmount();
				}
			, 6000ms
	</script>
</mk-ui-notification>
