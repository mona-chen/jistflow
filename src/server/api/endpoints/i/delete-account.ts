import $ from 'cafy';
import * as bcrypt from 'bcryptjs';
import User from '../../../../models/user';
import define from '../../define';
import { createDeleteNotesJob, createDeleteDriveFilesJob } from '../../../../queue';

export const meta = {
	requireCredential: true,

	secure: true,

	params: {
		password: {
			validator: $.str
		},
	}
};

export default define(meta, (ps, user) => new Promise(async (res, rej) => {
	// Compare password
	const same = await bcrypt.compare(ps.password, user.password);

	if (!same) {
		return rej('incorrect password');
	}

	await User.update({ _id: user._id }, {
		$set: {
			isDeleted: true,
			token: null,
			name: null,
			description: null,
			pinnedNoteIds: [],
			password: null,
			email: null,
			twitter: null,
			github: null,
			discord: null,
			profile: {},
			fields: [],
			clientSettings: {},
		}
	});

	createDeleteNotesJob(user);
	createDeleteDriveFilesJob(user);

	res();
}));
