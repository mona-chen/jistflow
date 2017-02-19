<mk-user-followers>
	<mk-users-list ref="list" fetch={ fetch } count={ user.followers_count } you-know-count={ user.followers_you_know_count } no-users={ 'フォロワーはいないようです。' }></mk-users-list>
	<style>
		:scope
			display block

	</style>
	<script>
		@mixin \api

		@user = @opts.user

		@fetch = (iknow, limit, cursor, cb) ~>
			@api \users/followers do
				user_id: @user.id
				iknow: iknow
				limit: limit
				cursor: if cursor? then cursor else undefined
			.then cb

		@on \mount ~>
			@refs.list.on \loaded ~>
				@trigger \loaded
	</script>
</mk-user-followers>
