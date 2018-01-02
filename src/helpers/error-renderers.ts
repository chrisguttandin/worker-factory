import { IAugmentedError, IParameterObject, compile } from 'compilerr';

const JSON_RPC_ERROR_CODES = { INTERNAL_ERROR: -32603, METHOD_NOT_FOUND: -32601 };

export const renderMethodNotFoundError: (missingParameters: IParameterObject) => IAugmentedError = compile({
    message: 'The requested method called "${method}" is not supported.',
    status: JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND
});

export const renderMissingResponseError: (missingParameters: IParameterObject) => IAugmentedError = compile({
    message: 'The handler of the method called "${method}" returned no required result.',
    status: JSON_RPC_ERROR_CODES.INTERNAL_ERROR
});

export const renderUnexpectedResultError: (missingParameters: IParameterObject) => IAugmentedError = compile({
    message: 'The handler of the method called "${method}" returned an unexpected result.',
    status: JSON_RPC_ERROR_CODES.INTERNAL_ERROR
});
