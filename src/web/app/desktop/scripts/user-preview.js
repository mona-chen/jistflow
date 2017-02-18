const riot = require('riot');

riot.mixin('user-preview', {
	init: () => {
		this.on('mount', () => {
			scan.call(this);
		});
		this.on('updated', () => {
			scan.call(this);
		});
		function scan(){
			this.root.querySelectorAll('[data-user-preview]:not([data-user-preview-attached])')
				.forEach(attach.bind(this));
		}
	}
});

function attach(el) {
	el.setAttribute('data-user-preview-attached', true);

	const user = el.getAttribute('data-user-preview');
	let tag = null;
	let showTimer = null;
	let hideTimer = null;

	el.addEventListener('mouseover', () => {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		showTimer = setTimeout(show, 500);
	});

	el.addEventListener('mouseleave', () => {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		hideTimer = setTimeout(close, 500);
	});

	this.on('unmount', () => {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		close();
	});

	const show = () => {
		if (tag) return;
		const preview = document.createElement('mk-user-preview');
		const rect = el.getBoundingClientRect();
		const x = rect.left + el.offsetWidth + window.pageXOffset;
		const y = rect.top + window.pageYOffset;
		preview.style.top = y + 'px';
		preview.style.left = x + 'px';
		preview.addEventListener('mouseover', () => {
			clearTimeout(hideTimer);
		});
		preview.addEventListener('mouseleave', () => {
			clearTimeout(showTimer);
			hideTimer = setTimeout(close, 500);
		});
		tag = riot.mount(document.body.appendChild(preview), {
			user: user
		})[0];
	}

	const close = () => {
		if (tag) {
			tag.close();
			tag = null;
		}
	}
}
