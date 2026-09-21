'use client';

import React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>, NextLinkProps {
  children?: React.ReactNode;
  to?: string;
  href?: any;
}

export const Link: React.FC<LinkProps> = ({ to, href, children, ...props }) => {
  const targetHref = href || to || '/';
  return (
    <NextLink href={targetHref} {...props}>
      {children}
    </NextLink>
  );
};

export const useNavigate = () => {
  const router = useNextRouter();
  return (to: string | number) => {
    if (typeof to === 'number') {
      window.history.go(to);
    } else {
      router.push(String(to));
    }
  };
};

export const useLocation = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return {
    pathname: pathname || '/',
    search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
  };
};