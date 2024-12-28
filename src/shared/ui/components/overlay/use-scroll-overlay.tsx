import { useEffect, useRef, useState } from 'react';

import "./overlay-list-border.css";

export const useScrollOverlay = () => {
	const [showTopOverlay, setShowTopOverlay] = useState(false);
	const [showBottomOverlay, setShowBottomOverlay] = useState(false);
	const listRef = useRef<HTMLUListElement>(null);
	const scrollTimeoutRef = useRef<NodeJS.Timeout>();
	const lastScrollTopRef = useRef(0);

	const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
		const target = e.currentTarget;
		const currentScrollTop = target.scrollTop;
		const isScrollingDown = currentScrollTop > lastScrollTopRef.current;
		
		lastScrollTopRef.current = currentScrollTop;
		
		if (isScrollingDown) {
			setShowTopOverlay(true);
			setShowBottomOverlay(false);
		} else {
			setShowTopOverlay(false);
			setShowBottomOverlay(true);
		}

		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		scrollTimeoutRef.current = setTimeout(() => {
			setShowTopOverlay(false);
			setShowBottomOverlay(false);
		}, 150);
	};

	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	return {
		listRef,
		showTopOverlay,
		showBottomOverlay,
		handleScroll,
	};
}; 