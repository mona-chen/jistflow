export enum IdType {
    IceshrimpId,
    MastodonId
}

const chars = '0123456789abcdefghijklmnopqrstuvwxyz';

//FIXME: This implementation breaks for IceshrimpIDs with leading zeroes
//FIXME: Make this idempotent
export function convertId(id: string, target: IdType): string {
    if (target == IdType.IceshrimpId) {
        return BigInt(id).toString(36);
    }
    else if (target == IdType.MastodonId) {
        let result = 0n;
        const iter = id.toLowerCase();

        for (let i = 0; i < iter.length; i++){
            const char = iter[i];
            if (!chars.includes(char)) throw new Error('Invalid ID');
            result = result * 36n + BigInt(chars.indexOf(char));
        }

        return result.toString();
    }
		throw new Error('Unknown ID type');
}
