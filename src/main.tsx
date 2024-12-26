import "reflect-metadata";

import { createRoot } from "react-dom/client";
import { Application } from "./application/application.tsx";
import "./index.css";

import { configure, spy } from 'mobx';
   
configure({ enforceActions: 'always' });

spy((event) => {
	if (event.type === "action") {
		console.log(`Action '${event.name}' was called`);
	}
});

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(<Application />);
