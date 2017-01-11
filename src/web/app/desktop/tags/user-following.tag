<mk-user-following>
	<mk-users-list fetch={ fetch } count={ user.following_count } you-know-count={ user.following_you_know_count } no-users={ 'フォロー中のユーザーはいないようです。' }></mk-users-list>
	<style type="stylus">
		:scope
			display block
			height 100%

	</style>
	<script>
		@mixin \api

		@user = @opts.user

		@fetch = (iknow, limit, cursor, cb) ~>
			@api \users/following do
				user_id: @user.id
				iknow: iknow
				limit: limit
				cursor: if cursor? then cursor else undefined
			.then cb
	</script>
</mk-user-following>
