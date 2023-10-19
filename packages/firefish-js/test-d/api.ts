import { expectType } from "tsd";
import * as firefish from "../src";

describe("API", () => {
	test("success", async () => {
		const cli = new firefish.api.APIClient({
			origin: "https://firefish.test",
			credential: "TOKEN",
		});
		const res = await cli.request("meta", { detail: true });
		expectType<firefish.entities.DetailedInstanceMetadata>(res);
	});

	test("conditional respose type (meta)", async () => {
		const cli = new firefish.api.APIClient({
			origin: "https://firefish.test",
			credential: "TOKEN",
		});

		const res = await cli.request("meta", { detail: true });
		expectType<firefish.entities.DetailedInstanceMetadata>(res);

		const res2 = await cli.request("meta", { detail: false });
		expectType<firefish.entities.LiteInstanceMetadata>(res2);

		const res3 = await cli.request("meta", {});
		expectType<firefish.entities.LiteInstanceMetadata>(res3);

		const res4 = await cli.request("meta", { detail: true as boolean });
		expectType<
			| firefish.entities.LiteInstanceMetadata
			| firefish.entities.DetailedInstanceMetadata
		>(res4);
	});

	test("conditional respose type (users/show)", async () => {
		const cli = new firefish.api.APIClient({
			origin: "https://firefish.test",
			credential: "TOKEN",
		});

		const res = await cli.request("users/show", { userId: "xxxxxxxx" });
		expectType<firefish.entities.UserDetailed>(res);

		const res2 = await cli.request("users/show", { userIds: ["xxxxxxxx"] });
		expectType<firefish.entities.UserDetailed[]>(res2);
	});
});
