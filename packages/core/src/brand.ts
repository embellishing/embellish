declare const __brand: unique symbol;

/**
 * Creates a branded type to add a unique symbol for type differentiation.
 *
 * @public
 */
export type Branded<T, B> = T & { [__brand]: B };
