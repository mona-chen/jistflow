<mk-user-followers>
	<mk-users-list ref="list" fetch={ fetch } count={ user.followers_count } you-know-count={ user.followers_you_know_count } no-users={ 'フォロワーはいないようです。' }></mk-users-list>
	<style>
		:scope
			display block

	</style>
	<script>
		this.mixin('api');

		this.user = this.opts.user

		this.fetch = (iknow, limit, cursor, cb) => {
			this.api 'users/followers' do
				user_id: @user.id
				iknow: iknow
				limit: limit
				cursor: if cursor? then cursor else undefined
			.then cb

		this.on('mount', () => {
			this.refs.list.on('loaded', () => {
				this.trigger('loaded');
	</script>
</mk-user-followers>
