export enum IdType {
    IceshrimpId,
    MastodonId
}

const chars = '0123456789abcdefghijklmnopqrstuvwxyz';

//FIXME: This implementation breaks for IceshrimpIDs with leading zeroes
//FIXME: Make this idempotent
export function convertId(id: string, target: IdType): string {
    if (target == IdType.IceshrimpId) {
        let input = BigInt(id);
        let result = '';

        while (input !== 0n) {
            result = chars.at(Number(input % 36n)) + result;
            input /= 36n;
        }

        return result;
    }
    else if (target == IdType.MastodonId) {
        let result = 0n;
        const iter = id.toLowerCase().split('').reverse();

        for (let i = 0; i < iter.length; i++){
            const char = iter[i];
            if (!chars.includes(char)) throw new Error('Invalid ID');
            result += BigInt(chars.indexOf(char)) * BigInt(36 ** i);
        }

        return result.toString();
    }
    throw new Error('Unknown ID type');
}
