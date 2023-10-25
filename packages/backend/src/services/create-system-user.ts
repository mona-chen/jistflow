import { v4 as uuid } from "uuid";
import generateNativeUserToken from "../server/api/common/generate-native-user-token.js";
import { genRsaKeyPair } from "@/misc/gen-key-pair.js";
import { User } from "@/models/entities/user.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { IsNull } from "typeorm";
import { genId } from "@/misc/gen-id.js";
import { UserKeypair } from "@/models/entities/user-keypair.js";
import { UsedUsername } from "@/models/entities/used-username.js";
import { db } from "@/db/postgre.js";
import { hashPassword } from "@/misc/password.js";
import { Users } from "@/models/index.js";

export async function createSystemUser(username: string): Promise<User> {
	const password = uuid();

	// Generate hash of password
	const hash = await hashPassword(password);

	// Generate secret
	const secret = generateNativeUserToken();

	const keyPair = await genRsaKeyPair(4096);

	let account!: User;

	const exist = await Users.findOneBy({
		usernameLower: username.toLowerCase(),
		host: IsNull(),
	});

	if (exist) throw new Error("the user is already exists");

	// Prepare objects
	const user = {
		id: genId(),
		createdAt: new Date(),
		username: username,
		usernameLower: username.toLowerCase(),
		host: null,
		token: secret,
		isAdmin: false,
		isLocked: true,
		isExplorable: false,
		isBot: true,
	};

	const userKeypair = {
		publicKey: keyPair.publicKey,
		privateKey: keyPair.privateKey,
		userId: user.id,
	};

	const userProfile = {
		userId: user.id,
		autoAcceptFollowed: false,
		password: hash,
	};

	const usedUsername = {
		createdAt: new Date(),
		username: username.toLowerCase(),
	}

	// Save the objects atomically using a db transaction, note that we should never run any code in a transaction block directly
	await db.transaction(async (transactionalEntityManager) => {
		await transactionalEntityManager.insert(User, user);
		await transactionalEntityManager.insert(UserKeypair, userKeypair);
		await transactionalEntityManager.insert(UserProfile, userProfile);
		await transactionalEntityManager.insert(UsedUsername, usedUsername);
	});

	return Users.findOneByOrFail({ id: user.id });
}
