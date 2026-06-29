"use client";
import { BadgeColor, BadgeType, BadgeSize } from './badge-types';

// TODO: Badges components: Badge, BadgeWithDot, BadgeWithIcon, BadgeWithButton, BadgeIcon for status labels.

export interface BadgeProps {
  type?: BadgeType;
  color?: BadgeColor;
  size?: BadgeSize;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps) {
  return <div>TODO: Badge</div>;
}

export interface BadgeWithDotProps extends BadgeProps {}
export function BadgeWithDot(props: BadgeWithDotProps) {
  return <div>TODO: BadgeWithDot</div>;
}

export interface BadgeWithIconProps extends BadgeProps {
  iconLeading?: React.ComponentType<{ className?: string }>;
}
export function BadgeWithIcon(props: BadgeWithIconProps) {
  return <div>TODO: BadgeWithIcon</div>;
}

export interface BadgeWithButtonProps extends BadgeProps {
  onButtonClick?: () => void;
}
export function BadgeWithButton(props: BadgeWithButtonProps) {
  return <div>TODO: BadgeWithButton</div>;
}

export interface BadgeIconProps extends Omit<BadgeProps, 'children'> {
  icon?: React.ComponentType<{ className?: string }>;
}
export function BadgeIcon(props: BadgeIconProps) {
  return <div>TODO: BadgeIcon</div>;
}
