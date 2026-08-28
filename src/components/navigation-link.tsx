"use client";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import React from "react";

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string | undefined;
  to?: string | undefined;
  children?: React.ReactNode;
  className?: string | undefined;
  replace?: boolean | undefined;
  scroll?: boolean | undefined;
  prefetch?: boolean | undefined;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, to, children, ...props }, ref) => {
    const target = href || to || "#";
    return (
      <NextLink ref={ref} {...(props as unknown as NextLinkProps)} href={target}>
        {children}
      </NextLink>
    );
  },
);

Link.displayName = "Link";

export default Link;
