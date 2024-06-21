<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@embellish/react](./react.md) &gt; [ComponentProps](./react.componentprops.md)

## ComponentProps type

Component props

**Signature:**

```typescript
export declare type ComponentProps<
P,
C extends string,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
As extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
InlineConditionName extends string,
> = {
    as?: As;
} & Omit<JSX.LibraryManagedAttributes<As, ComponentPropsWithRef<As>>, never> &
(string extends C
? unknown
: {
    conditions?: {
        [Name in InlineConditionName]: ValidConditionName<Name> &
        Condition<C>;
    };
}) &
Partial<{
    [PropName in
    | keyof P
    | (keyof P extends string
    ? `${C | InlineConditionName}:${keyof P}`
    : never)]: PropName extends `${C | InlineConditionName}:${infer BasePropName}`
    ? BasePropName extends keyof P
    ? P[BasePropName]
    : never
    : PropName extends keyof P
    ? P[PropName]
    : never;
}>;
```
**References:** [ComponentPropsWithRef](./react.componentpropswithref.md)<!-- -->, [ValidConditionName](./react.validconditionname.md)<!-- -->, [Condition](./react.condition.md)
