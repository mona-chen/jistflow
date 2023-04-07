export class chartV71644058404077 {
	name = "chartV71644058404077";

	async up(queryRunner) {
		await queryRunner.query(
			`UPDATE "__chart__federation" SET "___instance_total"=2147483647 WHERE "___instance_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__federation" SET "___instance_inc"=32767 WHERE "___instance_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__federation" SET "___instance_dec"=32767 WHERE "___instance_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__federation" SET "___instance_total"=2147483647 WHERE "___instance_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__federation" SET "___instance_inc"=32767 WHERE "___instance_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__federation" SET "___instance_dec"=32767 WHERE "___instance_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___local_total"=2147483647 WHERE "___local_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___local_inc"=2147483647 WHERE "___local_inc" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___local_dec"=2147483647 WHERE "___local_dec" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___local_diffs_normal"=2147483647 WHERE "___local_diffs_normal" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___local_diffs_reply"=2147483647 WHERE "___local_diffs_reply" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___local_diffs_renote"=2147483647 WHERE "___local_diffs_renote" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___remote_total"=2147483647 WHERE "___remote_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___remote_inc"=2147483647 WHERE "___remote_inc" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___remote_dec"=2147483647 WHERE "___remote_dec" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___remote_diffs_normal"=2147483647 WHERE "___remote_diffs_normal" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___remote_diffs_reply"=2147483647 WHERE "___remote_diffs_reply" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__notes" SET "___remote_diffs_renote"=2147483647 WHERE "___remote_diffs_renote" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___local_total"=2147483647 WHERE "___local_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___local_inc"=2147483647 WHERE "___local_inc" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___local_dec"=2147483647 WHERE "___local_dec" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___local_diffs_normal"=2147483647 WHERE "___local_diffs_normal" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___local_diffs_reply"=2147483647 WHERE "___local_diffs_reply" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___local_diffs_renote"=2147483647 WHERE "___local_diffs_renote" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___remote_total"=2147483647 WHERE "___remote_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___remote_inc"=2147483647 WHERE "___remote_inc" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___remote_dec"=2147483647 WHERE "___remote_dec" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___remote_diffs_normal"=2147483647 WHERE "___remote_diffs_normal" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___remote_diffs_reply"=2147483647 WHERE "___remote_diffs_reply" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__notes" SET "___remote_diffs_renote"=2147483647 WHERE "___remote_diffs_renote" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__users" SET "___local_total"=2147483647 WHERE "___local_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__users" SET "___local_inc"=32767 WHERE "___local_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__users" SET "___local_dec"=32767 WHERE "___local_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__users" SET "___remote_total"=2147483647 WHERE "___remote_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__users" SET "___remote_inc"=32767 WHERE "___remote_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__users" SET "___remote_dec"=32767 WHERE "___remote_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__users" SET "___local_total"=2147483647 WHERE "___local_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__users" SET "___local_inc"=32767 WHERE "___local_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__users" SET "___local_dec"=32767 WHERE "___local_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__users" SET "___remote_total"=2147483647 WHERE "___remote_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__users" SET "___remote_inc"=32767 WHERE "___remote_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__users" SET "___remote_dec"=32767 WHERE "___remote_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__network" SET "___incomingRequests"=2147483647 WHERE "___incomingRequests" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__network" SET "___outgoingRequests"=2147483647 WHERE "___outgoingRequests" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__network" SET "___totalTime"=2147483647 WHERE "___totalTime" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__network" SET "___incomingBytes"=2147483647 WHERE "___incomingBytes" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__network" SET "___outgoingBytes"=2147483647 WHERE "___outgoingBytes" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__network" SET "___incomingRequests"=2147483647 WHERE "___incomingRequests" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__network" SET "___outgoingRequests"=2147483647 WHERE "___outgoingRequests" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__network" SET "___totalTime"=2147483647 WHERE "___totalTime" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__network" SET "___incomingBytes"=2147483647 WHERE "___incomingBytes" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__network" SET "___outgoingBytes"=2147483647 WHERE "___outgoingBytes" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___requests_failed"=32767 WHERE "___requests_failed" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___requests_succeeded"=32767 WHERE "___requests_succeeded" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___requests_received"=32767 WHERE "___requests_received" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___notes_total"=2147483647 WHERE "___notes_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___notes_inc"=2147483647 WHERE "___notes_inc" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___notes_dec"=2147483647 WHERE "___notes_dec" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___notes_diffs_normal"=2147483647 WHERE "___notes_diffs_normal" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___notes_diffs_reply"=2147483647 WHERE "___notes_diffs_reply" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___notes_diffs_renote"=2147483647 WHERE "___notes_diffs_renote" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___users_total"=2147483647 WHERE "___users_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___users_inc"=32767 WHERE "___users_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___users_dec"=32767 WHERE "___users_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___following_total"=2147483647 WHERE "___following_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___following_inc"=32767 WHERE "___following_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___following_dec"=32767 WHERE "___following_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___followers_total"=2147483647 WHERE "___followers_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___followers_inc"=32767 WHERE "___followers_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___followers_dec"=32767 WHERE "___followers_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___drive_totalFiles"=2147483647 WHERE "___drive_totalFiles" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___drive_incFiles"=2147483647 WHERE "___drive_incFiles" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___drive_decFiles"=2147483647 WHERE "___drive_decFiles" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___drive_incUsage"=2147483647 WHERE "___drive_incUsage" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__instance" SET "___drive_decUsage"=2147483647 WHERE "___drive_decUsage" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___requests_failed"=32767 WHERE "___requests_failed" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___requests_succeeded"=32767 WHERE "___requests_succeeded" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___requests_received"=32767 WHERE "___requests_received" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___notes_total"=2147483647 WHERE "___notes_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___notes_inc"=2147483647 WHERE "___notes_inc" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___notes_dec"=2147483647 WHERE "___notes_dec" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___notes_diffs_normal"=2147483647 WHERE "___notes_diffs_normal" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___notes_diffs_reply"=2147483647 WHERE "___notes_diffs_reply" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___notes_diffs_renote"=2147483647 WHERE "___notes_diffs_renote" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___users_total"=2147483647 WHERE "___users_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___users_inc"=32767 WHERE "___users_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___users_dec"=32767 WHERE "___users_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___following_total"=2147483647 WHERE "___following_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___following_inc"=32767 WHERE "___following_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___following_dec"=32767 WHERE "___following_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___followers_total"=2147483647 WHERE "___followers_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___followers_inc"=32767 WHERE "___followers_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___followers_dec"=32767 WHERE "___followers_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___drive_totalFiles"=2147483647 WHERE "___drive_totalFiles" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___drive_incFiles"=2147483647 WHERE "___drive_incFiles" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___drive_decFiles"=2147483647 WHERE "___drive_decFiles" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___drive_incUsage"=2147483647 WHERE "___drive_incUsage" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__instance" SET "___drive_decUsage"=2147483647 WHERE "___drive_decUsage" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_notes" SET "___total"=2147483647 WHERE "___total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_notes" SET "___inc"=32767 WHERE "___inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_notes" SET "___dec"=32767 WHERE "___dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_notes" SET "___diffs_normal"=32767 WHERE "___diffs_normal" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_notes" SET "___diffs_reply"=32767 WHERE "___diffs_reply" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_notes" SET "___diffs_renote"=32767 WHERE "___diffs_renote" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_notes" SET "___total"=2147483647 WHERE "___total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_notes" SET "___inc"=32767 WHERE "___inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_notes" SET "___dec"=32767 WHERE "___dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_notes" SET "___diffs_normal"=32767 WHERE "___diffs_normal" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_notes" SET "___diffs_reply"=32767 WHERE "___diffs_reply" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_notes" SET "___diffs_renote"=32767 WHERE "___diffs_renote" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__drive" SET "___local_incCount"=2147483647 WHERE "___local_incCount" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__drive" SET "___local_incSize"=2147483647 WHERE "___local_incSize" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__drive" SET "___local_decCount"=2147483647 WHERE "___local_decCount" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__drive" SET "___local_decSize"=2147483647 WHERE "___local_decSize" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__drive" SET "___remote_incCount"=2147483647 WHERE "___remote_incCount" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__drive" SET "___remote_incSize"=2147483647 WHERE "___remote_incSize" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__drive" SET "___remote_decCount"=2147483647 WHERE "___remote_decCount" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__drive" SET "___remote_decSize"=2147483647 WHERE "___remote_decSize" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__drive" SET "___local_incCount"=2147483647 WHERE "___local_incCount" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__drive" SET "___local_incSize"=2147483647 WHERE "___local_incSize" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__drive" SET "___local_decCount"=2147483647 WHERE "___local_decCount" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__drive" SET "___local_decSize"=2147483647 WHERE "___local_decSize" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__drive" SET "___remote_incCount"=2147483647 WHERE "___remote_incCount" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__drive" SET "___remote_incSize"=2147483647 WHERE "___remote_incSize" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__drive" SET "___remote_decCount"=2147483647 WHERE "___remote_decCount" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__drive" SET "___remote_decSize"=2147483647 WHERE "___remote_decSize" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_reaction" SET "___local_count"=32767 WHERE "___local_count" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_reaction" SET "___remote_count"=32767 WHERE "___remote_count" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_reaction" SET "___local_count"=32767 WHERE "___local_count" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_reaction" SET "___remote_count"=32767 WHERE "___remote_count" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___local_followings_total"=2147483647 WHERE "___local_followings_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___local_followings_inc"=32767 WHERE "___local_followings_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___local_followings_dec"=32767 WHERE "___local_followings_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___local_followers_total"=2147483647 WHERE "___local_followers_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___local_followers_inc"=32767 WHERE "___local_followers_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___local_followers_dec"=32767 WHERE "___local_followers_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___remote_followings_total"=2147483647 WHERE "___remote_followings_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___remote_followings_inc"=32767 WHERE "___remote_followings_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___remote_followings_dec"=32767 WHERE "___remote_followings_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___remote_followers_total"=2147483647 WHERE "___remote_followers_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___remote_followers_inc"=32767 WHERE "___remote_followers_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart__per_user_following" SET "___remote_followers_dec"=32767 WHERE "___remote_followers_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___local_followings_total"=2147483647 WHERE "___local_followings_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___local_followings_inc"=32767 WHERE "___local_followings_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___local_followings_dec"=32767 WHERE "___local_followings_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___local_followers_total"=2147483647 WHERE "___local_followers_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___local_followers_inc"=32767 WHERE "___local_followers_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___local_followers_dec"=32767 WHERE "___local_followers_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___remote_followings_total"=2147483647 WHERE "___remote_followings_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___remote_followings_inc"=32767 WHERE "___remote_followings_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___remote_followings_dec"=32767 WHERE "___remote_followings_dec" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___remote_followers_total"=2147483647 WHERE "___remote_followers_total" > 2147483647`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___remote_followers_inc"=32767 WHERE "___remote_followers_inc" > 32767`,
		);
		await queryRunner.query(
			`UPDATE "__chart_day__per_user_following" SET "___remote_followers_dec"=32767 WHERE "___remote_followers_dec" > 32767`,
		);
		await queryRunner.query(`TRUNCATE TABLE "__chart__per_user_drive"`);
		await queryRunner.query(`TRUNCATE TABLE "__chart_day__per_user_drive"`);

		await queryRunner.query(
			`ALTER TABLE "__chart__federation" ALTER COLUMN "___instance_total" TYPE integer USING "___instance_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__federation" ALTER COLUMN "___instance_inc" TYPE smallint USING "___instance_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__federation" ALTER COLUMN "___instance_dec" TYPE smallint USING "___instance_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__federation" ALTER COLUMN "___instance_total" TYPE integer USING "___instance_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__federation" ALTER COLUMN "___instance_inc" TYPE smallint USING "___instance_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__federation" ALTER COLUMN "___instance_dec" TYPE smallint USING "___instance_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_total" TYPE integer USING "___local_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_inc" TYPE integer USING "___local_inc"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_dec" TYPE integer USING "___local_dec"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_diffs_normal" TYPE integer USING "___local_diffs_normal"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_diffs_reply" TYPE integer USING "___local_diffs_reply"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_diffs_renote" TYPE integer USING "___local_diffs_renote"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_total" TYPE integer USING "___remote_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_inc" TYPE integer USING "___remote_inc"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_dec" TYPE integer USING "___remote_dec"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_diffs_normal" TYPE integer USING "___remote_diffs_normal"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_diffs_reply" TYPE integer USING "___remote_diffs_reply"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_diffs_renote" TYPE integer USING "___remote_diffs_renote"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_total" TYPE integer USING "___local_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_inc" TYPE integer USING "___local_inc"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_dec" TYPE integer USING "___local_dec"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_diffs_normal" TYPE integer USING "___local_diffs_normal"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_diffs_reply" TYPE integer USING "___local_diffs_reply"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_diffs_renote" TYPE integer USING "___local_diffs_renote"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_total" TYPE integer USING "___remote_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_inc" TYPE integer USING "___remote_inc"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_dec" TYPE integer USING "___remote_dec"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_diffs_normal" TYPE integer USING "___remote_diffs_normal"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_diffs_reply" TYPE integer USING "___remote_diffs_reply"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_diffs_renote" TYPE integer USING "___remote_diffs_renote"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___local_total" TYPE integer USING "___local_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___local_inc" TYPE smallint USING "___local_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___local_dec" TYPE smallint USING "___local_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___remote_total" TYPE integer USING "___remote_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___remote_inc" TYPE smallint USING "___remote_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___remote_dec" TYPE smallint USING "___remote_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___local_total" TYPE integer USING "___local_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___local_inc" TYPE smallint USING "___local_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___local_dec" TYPE smallint USING "___local_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___remote_total" TYPE integer USING "___remote_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___remote_inc" TYPE smallint USING "___remote_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___remote_dec" TYPE smallint USING "___remote_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___incomingRequests" TYPE integer USING "___incomingRequests"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___outgoingRequests" TYPE integer USING "___outgoingRequests"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___totalTime" TYPE integer USING "___totalTime"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___incomingBytes" TYPE integer USING "___incomingBytes"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___outgoingBytes" TYPE integer USING "___outgoingBytes"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___incomingRequests" TYPE integer USING "___incomingRequests"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___outgoingRequests" TYPE integer USING "___outgoingRequests"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___totalTime" TYPE integer USING "___totalTime"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___incomingBytes" TYPE integer USING "___incomingBytes"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___outgoingBytes" TYPE integer USING "___outgoingBytes"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___requests_failed" TYPE smallint USING "___requests_failed"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___requests_succeeded" TYPE smallint USING "___requests_succeeded"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___requests_received" TYPE smallint USING "___requests_received"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_total" TYPE integer USING "___notes_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_inc" TYPE integer USING "___notes_inc"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_dec" TYPE integer USING "___notes_dec"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_diffs_normal" TYPE integer USING "___notes_diffs_normal"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_diffs_reply" TYPE integer USING "___notes_diffs_reply"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_diffs_renote" TYPE integer USING "___notes_diffs_renote"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___users_total" TYPE integer USING "___users_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___users_inc" TYPE smallint USING "___users_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___users_dec" TYPE smallint USING "___users_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___following_total" TYPE integer USING "___following_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___following_inc" TYPE smallint USING "___following_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___following_dec" TYPE smallint USING "___following_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___followers_total" TYPE integer USING "___followers_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___followers_inc" TYPE smallint USING "___followers_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___followers_dec" TYPE smallint USING "___followers_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_totalFiles" TYPE integer USING "___drive_totalFiles"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_incFiles" TYPE integer USING "___drive_incFiles"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_decFiles" TYPE integer USING "___drive_decFiles"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_incUsage" TYPE integer USING "___drive_incUsage"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_decUsage" TYPE integer USING "___drive_decUsage"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___requests_failed" TYPE smallint USING "___requests_failed"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___requests_succeeded" TYPE smallint USING "___requests_succeeded"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___requests_received" TYPE smallint USING "___requests_received"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_total" TYPE integer USING "___notes_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_inc" TYPE integer USING "___notes_inc"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_dec" TYPE integer USING "___notes_dec"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_diffs_normal" TYPE integer USING "___notes_diffs_normal"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_diffs_reply" TYPE integer USING "___notes_diffs_reply"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_diffs_renote" TYPE integer USING "___notes_diffs_renote"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___users_total" TYPE integer USING "___users_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___users_inc" TYPE smallint USING "___users_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___users_dec" TYPE smallint USING "___users_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___following_total" TYPE integer USING "___following_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___following_inc" TYPE smallint USING "___following_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___following_dec" TYPE smallint USING "___following_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___followers_total" TYPE integer USING "___followers_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___followers_inc" TYPE smallint USING "___followers_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___followers_dec" TYPE smallint USING "___followers_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_totalFiles" TYPE integer USING "___drive_totalFiles"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_incFiles" TYPE integer USING "___drive_incFiles"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_decFiles" TYPE integer USING "___drive_decFiles"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_incUsage" TYPE integer USING "___drive_incUsage"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_decUsage" TYPE integer USING "___drive_decUsage"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___total" TYPE integer USING "___total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___inc" TYPE smallint USING "___inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___dec" TYPE smallint USING "___dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___diffs_normal" TYPE smallint USING "___diffs_normal"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___diffs_reply" TYPE smallint USING "___diffs_reply"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___diffs_renote" TYPE smallint USING "___diffs_renote"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___total" TYPE integer USING "___total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___inc" TYPE smallint USING "___inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___dec" TYPE smallint USING "___dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___diffs_normal" TYPE smallint USING "___diffs_normal"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___diffs_reply" TYPE smallint USING "___diffs_reply"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___diffs_renote" TYPE smallint USING "___diffs_renote"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___local_incCount" TYPE integer USING "___local_incCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___local_incSize" TYPE integer USING "___local_incSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___local_decCount" TYPE integer USING "___local_decCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___local_decSize" TYPE integer USING "___local_decSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___remote_incCount" TYPE integer USING "___remote_incCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___remote_incSize" TYPE integer USING "___remote_incSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___remote_decCount" TYPE integer USING "___remote_decCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___remote_decSize" TYPE integer USING "___remote_decSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___local_incCount" TYPE integer USING "___local_incCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___local_incSize" TYPE integer USING "___local_incSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___local_decCount" TYPE integer USING "___local_decCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___local_decSize" TYPE integer USING "___local_decSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___remote_incCount" TYPE integer USING "___remote_incCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___remote_incSize" TYPE integer USING "___remote_incSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___remote_decCount" TYPE integer USING "___remote_decCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___remote_decSize" TYPE integer USING "___remote_decSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_reaction" ALTER COLUMN "___local_count" TYPE smallint USING "___local_count"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_reaction" ALTER COLUMN "___remote_count" TYPE smallint USING "___remote_count"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_reaction" ALTER COLUMN "___local_count" TYPE smallint USING "___local_count"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_reaction" ALTER COLUMN "___remote_count" TYPE smallint USING "___remote_count"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followings_total" TYPE integer USING "___local_followings_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followings_inc" TYPE smallint USING "___local_followings_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followings_dec" TYPE smallint USING "___local_followings_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followers_total" TYPE integer USING "___local_followers_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followers_inc" TYPE smallint USING "___local_followers_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followers_dec" TYPE smallint USING "___local_followers_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followings_total" TYPE integer USING "___remote_followings_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followings_inc" TYPE smallint USING "___remote_followings_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followings_dec" TYPE smallint USING "___remote_followings_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followers_total" TYPE integer USING "___remote_followers_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followers_inc" TYPE smallint USING "___remote_followers_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followers_dec" TYPE smallint USING "___remote_followers_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followings_total" TYPE integer USING "___local_followings_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followings_inc" TYPE smallint USING "___local_followings_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followings_dec" TYPE smallint USING "___local_followings_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followers_total" TYPE integer USING "___local_followers_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followers_inc" TYPE smallint USING "___local_followers_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followers_dec" TYPE smallint USING "___local_followers_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followings_total" TYPE integer USING "___remote_followings_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followings_inc" TYPE smallint USING "___remote_followings_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followings_dec" TYPE smallint USING "___remote_followings_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followers_total" TYPE integer USING "___remote_followers_total"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followers_inc" TYPE smallint USING "___remote_followers_inc"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followers_dec" TYPE smallint USING "___remote_followers_dec"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___totalCount" TYPE integer USING "___totalCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___totalSize" TYPE integer USING "___totalSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___incCount" TYPE smallint USING "___incCount"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___incSize" TYPE integer USING "___incSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___decCount" TYPE smallint USING "___decCount"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___decSize" TYPE integer USING "___decSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___totalCount" TYPE integer USING "___totalCount"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___totalSize" TYPE integer USING "___totalSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___incCount" TYPE smallint USING "___incCount"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___incSize" TYPE integer USING "___incSize"::integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___decCount" TYPE smallint USING "___decCount"::smallint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___decSize" TYPE integer USING "___decSize"::integer`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "__chart__federation" ALTER COLUMN "___instance_total" TYPE bigint USING "___instance_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__federation" ALTER COLUMN "___instance_inc" TYPE bigint USING "___instance_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__federation" ALTER COLUMN "___instance_dec" TYPE bigint USING "___instance_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__federation" ALTER COLUMN "___instance_total" TYPE bigint USING "___instance_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__federation" ALTER COLUMN "___instance_inc" TYPE bigint USING "___instance_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__federation" ALTER COLUMN "___instance_dec" TYPE bigint USING "___instance_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_total" TYPE bigint USING "___local_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_inc" TYPE bigint USING "___local_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_dec" TYPE bigint USING "___local_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_diffs_normal" TYPE bigint USING "___local_diffs_normal"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_diffs_reply" TYPE bigint USING "___local_diffs_reply"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___local_diffs_renote" TYPE bigint USING "___local_diffs_renote"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_total" TYPE bigint USING "___remote_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_inc" TYPE bigint USING "___remote_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_dec" TYPE bigint USING "___remote_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_diffs_normal" TYPE bigint USING "___remote_diffs_normal"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_diffs_reply" TYPE bigint USING "___remote_diffs_reply"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__notes" ALTER COLUMN "___remote_diffs_renote" TYPE bigint USING "___remote_diffs_renote"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_total" TYPE bigint USING "___local_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_inc" TYPE bigint USING "___local_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_dec" TYPE bigint USING "___local_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_diffs_normal" TYPE bigint USING "___local_diffs_normal"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_diffs_reply" TYPE bigint USING "___local_diffs_reply"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___local_diffs_renote" TYPE bigint USING "___local_diffs_renote"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_total" TYPE bigint USING "___remote_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_inc" TYPE bigint USING "___remote_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_dec" TYPE bigint USING "___remote_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_diffs_normal" TYPE bigint USING "___remote_diffs_normal"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_diffs_reply" TYPE bigint USING "___remote_diffs_reply"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__notes" ALTER COLUMN "___remote_diffs_renote" TYPE bigint USING "___remote_diffs_renote"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___local_total" TYPE bigint USING "___local_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___local_inc" TYPE bigint USING "___local_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___local_dec" TYPE bigint USING "___local_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___remote_total" TYPE bigint USING "___remote_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___remote_inc" TYPE bigint USING "___remote_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__users" ALTER COLUMN "___remote_dec" TYPE bigint USING "___remote_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___local_total" TYPE bigint USING "___local_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___local_inc" TYPE bigint USING "___local_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___local_dec" TYPE bigint USING "___local_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___remote_total" TYPE bigint USING "___remote_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___remote_inc" TYPE bigint USING "___remote_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__users" ALTER COLUMN "___remote_dec" TYPE bigint USING "___remote_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___incomingRequests" TYPE bigint USING "___incomingRequests"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___outgoingRequests" TYPE bigint USING "___outgoingRequests"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___totalTime" TYPE bigint USING "___totalTime"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___incomingBytes" TYPE bigint USING "___incomingBytes"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__network" ALTER COLUMN "___outgoingBytes" TYPE bigint USING "___outgoingBytes"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___incomingRequests" TYPE bigint USING "___incomingRequests"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___outgoingRequests" TYPE bigint USING "___outgoingRequests"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___totalTime" TYPE bigint USING "___totalTime"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___incomingBytes" TYPE bigint USING "___incomingBytes"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__network" ALTER COLUMN "___outgoingBytes" TYPE bigint USING "___outgoingBytes"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___requests_failed" TYPE bigint USING "___requests_failed"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___requests_succeeded" TYPE bigint USING "___requests_succeeded"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___requests_received" TYPE bigint USING "___requests_received"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_total" TYPE bigint USING "___notes_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_inc" TYPE bigint USING "___notes_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_dec" TYPE bigint USING "___notes_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_diffs_normal" TYPE bigint USING "___notes_diffs_normal"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_diffs_reply" TYPE bigint USING "___notes_diffs_reply"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___notes_diffs_renote" TYPE bigint USING "___notes_diffs_renote"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___users_total" TYPE bigint USING "___users_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___users_inc" TYPE bigint USING "___users_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___users_dec" TYPE bigint USING "___users_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___following_total" TYPE bigint USING "___following_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___following_inc" TYPE bigint USING "___following_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___following_dec" TYPE bigint USING "___following_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___followers_total" TYPE bigint USING "___followers_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___followers_inc" TYPE bigint USING "___followers_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___followers_dec" TYPE bigint USING "___followers_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_totalFiles" TYPE bigint USING "___drive_totalFiles"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_incFiles" TYPE bigint USING "___drive_incFiles"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_decFiles" TYPE bigint USING "___drive_decFiles"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_incUsage" TYPE bigint USING "___drive_incUsage"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__instance" ALTER COLUMN "___drive_decUsage" TYPE bigint USING "___drive_decUsage"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___requests_failed" TYPE bigint USING "___requests_failed"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___requests_succeeded" TYPE bigint USING "___requests_succeeded"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___requests_received" TYPE bigint USING "___requests_received"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_total" TYPE bigint USING "___notes_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_inc" TYPE bigint USING "___notes_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_dec" TYPE bigint USING "___notes_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_diffs_normal" TYPE bigint USING "___notes_diffs_normal"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_diffs_reply" TYPE bigint USING "___notes_diffs_reply"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___notes_diffs_renote" TYPE bigint USING "___notes_diffs_renote"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___users_total" TYPE bigint USING "___users_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___users_inc" TYPE bigint USING "___users_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___users_dec" TYPE bigint USING "___users_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___following_total" TYPE bigint USING "___following_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___following_inc" TYPE bigint USING "___following_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___following_dec" TYPE bigint USING "___following_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___followers_total" TYPE bigint USING "___followers_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___followers_inc" TYPE bigint USING "___followers_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___followers_dec" TYPE bigint USING "___followers_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_totalFiles" TYPE bigint USING "___drive_totalFiles"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_incFiles" TYPE bigint USING "___drive_incFiles"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_decFiles" TYPE bigint USING "___drive_decFiles"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_incUsage" TYPE bigint USING "___drive_incUsage"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__instance" ALTER COLUMN "___drive_decUsage" TYPE bigint USING "___drive_decUsage"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___total" TYPE bigint USING "___total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___inc" TYPE bigint USING "___inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___dec" TYPE bigint USING "___dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___diffs_normal" TYPE bigint USING "___diffs_normal"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___diffs_reply" TYPE bigint USING "___diffs_reply"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_notes" ALTER COLUMN "___diffs_renote" TYPE bigint USING "___diffs_renote"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___total" TYPE bigint USING "___total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___inc" TYPE bigint USING "___inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___dec" TYPE bigint USING "___dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___diffs_normal" TYPE bigint USING "___diffs_normal"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___diffs_reply" TYPE bigint USING "___diffs_reply"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_notes" ALTER COLUMN "___diffs_renote" TYPE bigint USING "___diffs_renote"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___local_incCount" TYPE bigint USING "___local_incCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___local_incSize" TYPE bigint USING "___local_incSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___local_decCount" TYPE bigint USING "___local_decCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___local_decSize" TYPE bigint USING "___local_decSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___remote_incCount" TYPE bigint USING "___remote_incCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___remote_incSize" TYPE bigint USING "___remote_incSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___remote_decCount" TYPE bigint USING "___remote_decCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__drive" ALTER COLUMN "___remote_decSize" TYPE bigint USING "___remote_decSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___local_incCount" TYPE bigint USING "___local_incCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___local_incSize" TYPE bigint USING "___local_incSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___local_decCount" TYPE bigint USING "___local_decCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___local_decSize" TYPE bigint USING "___local_decSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___remote_incCount" TYPE bigint USING "___remote_incCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___remote_incSize" TYPE bigint USING "___remote_incSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___remote_decCount" TYPE bigint USING "___remote_decCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__drive" ALTER COLUMN "___remote_decSize" TYPE bigint USING "___remote_decSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_reaction" ALTER COLUMN "___local_count" TYPE bigint USING "___local_count"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_reaction" ALTER COLUMN "___remote_count" TYPE bigint USING "___remote_count"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_reaction" ALTER COLUMN "___local_count" TYPE bigint USING "___local_count"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_reaction" ALTER COLUMN "___remote_count" TYPE bigint USING "___remote_count"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followings_total" TYPE bigint USING "___local_followings_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followings_inc" TYPE bigint USING "___local_followings_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followings_dec" TYPE bigint USING "___local_followings_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followers_total" TYPE bigint USING "___local_followers_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followers_inc" TYPE bigint USING "___local_followers_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___local_followers_dec" TYPE bigint USING "___local_followers_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followings_total" TYPE bigint USING "___remote_followings_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followings_inc" TYPE bigint USING "___remote_followings_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followings_dec" TYPE bigint USING "___remote_followings_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followers_total" TYPE bigint USING "___remote_followers_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followers_inc" TYPE bigint USING "___remote_followers_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_following" ALTER COLUMN "___remote_followers_dec" TYPE bigint USING "___remote_followers_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followings_total" TYPE bigint USING "___local_followings_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followings_inc" TYPE bigint USING "___local_followings_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followings_dec" TYPE bigint USING "___local_followings_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followers_total" TYPE bigint USING "___local_followers_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followers_inc" TYPE bigint USING "___local_followers_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___local_followers_dec" TYPE bigint USING "___local_followers_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followings_total" TYPE bigint USING "___remote_followings_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followings_inc" TYPE bigint USING "___remote_followings_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followings_dec" TYPE bigint USING "___remote_followings_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followers_total" TYPE bigint USING "___remote_followers_total"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followers_inc" TYPE bigint USING "___remote_followers_inc"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_following" ALTER COLUMN "___remote_followers_dec" TYPE bigint USING "___remote_followers_dec"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___totalCount" TYPE bigint USING "___totalCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___totalSize" TYPE bigint USING "___totalSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___incCount" TYPE bigint USING "___incCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___incSize" TYPE bigint USING "___incSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___decCount" TYPE bigint USING "___decCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__per_user_drive" ALTER COLUMN "___decSize" TYPE bigint USING "___decSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___totalCount" TYPE bigint USING "___totalCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___totalSize" TYPE bigint USING "___totalSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___incCount" TYPE bigint USING "___incCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___incSize" TYPE bigint USING "___incSize"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___decCount" TYPE bigint USING "___decCount"::bigint`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__per_user_drive" ALTER COLUMN "___decSize" TYPE bigint USING "___decSize"::bigint`,
		);
	}
}
