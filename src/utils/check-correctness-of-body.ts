import { BadRequestError } from '../errors/bad-request-error';

export function checkCorrectnessOfBody(body: object, requiredParams: string[]) {
    let requiredParamsCount = 0;
    for (const [key, value] of Object.entries(body)) {
        if (!requiredParams.includes(key)) {
            throw new BadRequestError(`Unnecessary parameter ${key}`);
        } else if (
            requiredParams.includes(key) &&
            typeof value === 'undefined'
        ) {
            throw new BadRequestError(
                `Required parameter ${key} is undefined.`,
            );
        }
        requiredParamsCount += 1;
    }
    if (requiredParamsCount < requiredParams.length) {
        throw new BadRequestError(
            'Not all required parameters are transferred.',
        );
    }
    return true;
}
