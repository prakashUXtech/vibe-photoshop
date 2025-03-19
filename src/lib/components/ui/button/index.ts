import type { ComponentProps } from 'svelte';
import Root from './button.svelte';

type Props = ComponentProps<Root>;

export {
	Root,
	type Props,
	//
	Root as Button,
	type Props as ButtonProps
}; 