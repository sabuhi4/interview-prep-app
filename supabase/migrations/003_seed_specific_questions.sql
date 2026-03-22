-- JavaScript questions
INSERT INTO questions (id, category, difficulty, question, answer, tags, admin_only) VALUES
(
  'js-service-workers',
  'JavaScript',
  'hard',
  'What are service workers, and what are they used for?',
  'Service workers are scripts that run in the background of a web application, separate from the web page''s main thread, and provide features like offline caching, push notifications, and background synchronization. They act as a proxy between the browser and the network, intercepting requests and enabling the app to function offline or on slow networks by serving cached responses. They are a core part of Progressive Web Apps (PWAs).',
  ARRAY['service-workers', 'pwa', 'caching', 'offline', 'background-sync'],
  false
),
(
  'js-same-origin-policy',
  'JavaScript',
  'medium',
  'What is the Same-Origin Policy in web development?',
  'The Same-Origin Policy is a security feature in browsers designed to prevent a web site from accessing data from another site. Two URLs share the same origin only if they have the same protocol, host, and port. This policy helps protect users from malicious scripts that try to steal sensitive data from other websites, such as cookies, local storage, or content. A way to overcome this limitation is through CORS (Cross-Origin Resource Sharing): as long as the server specifies which domains it can receive requests from via the Access-Control-Allow-Origin header, and the client sends the right headers, they can interact even across different origins.',
  ARRAY['cors', 'security', 'same-origin', 'http-headers', 'browser'],
  false
),
(
  'js-spa-state-management',
  'JavaScript',
  'hard',
  'How do you handle state management in single-page applications without a framework?',
  'Without a full framework like React or Vue.js, there are several approaches: Global Variables — use a global object to centralize state, though it becomes unmanageable for large apps. Module Pattern — encapsulate state and provide a clear API to manage it, allowing local instances per component. Pub/Sub Pattern — decouple state changes using event-driven architecture for greater flexibility. State Management Libraries — use Redux or similar libraries independently of a framework. The right choice depends on app complexity: the module pattern works for medium apps, while Pub/Sub or Redux-like libraries scale better for large applications.',
  ARRAY['state-management', 'spa', 'module-pattern', 'pubsub', 'redux'],
  false
),
(
  'js-tree-shaking',
  'JavaScript',
  'hard',
  'What is tree shaking, and how does it help with the performance of a web application?',
  'Tree shaking is a technique used in JavaScript module bundlers like Webpack or Vite to remove unused code from the final bundled output. It works by statically analyzing ES module import/export statements to determine which exports are actually used, then excluding the rest from the bundle. The main benefits are: reduced bundle size (removing dead code reduces the JavaScript sent to the client, improving load times and bandwidth usage), improved performance (smaller bundles parse and execute faster), and better resource utilization (developers can write modular code without worrying about unused dependencies bloating the output).',
  ARRAY['tree-shaking', 'webpack', 'vite', 'bundler', 'performance', 'dead-code'],
  false
),
(
  'js-micro-frontends',
  'JavaScript',
  'hard',
  'What are Micro Frontends (MFEs), and what is their primary benefit?',
  'Micro Frontends are an architectural style where a single large front-end application is composed of several smaller, independently developed and deployed applications. Each team owns a vertical slice of the product — from the UI to the backend. The main benefits are: independent deployment (teams can ship features without coordinating with the entire org), faster development cycles (smaller codebases are easier to work with), technology heterogeneity (different teams can use different frameworks if needed), and improved fault isolation. Common implementation approaches include iframes, Web Components, module federation (Webpack 5), and server-side composition.',
  ARRAY['micro-frontends', 'architecture', 'module-federation', 'independent-deployment', 'scalability'],
  false
);

-- CSS questions
INSERT INTO questions (id, category, difficulty, question, answer, tags, admin_only) VALUES
(
  'css-variables',
  'CSS',
  'medium',
  'What are CSS variables, and when would you use them?',
  'CSS variables (also called custom properties) are entities defined by developers that can be reused throughout a CSS stylesheet. They are declared with a double-dash prefix (e.g. --primary-color: #3b82f6) and accessed via the var() function. They are great for centralizing global values like colors, spacing, and font sizes — change the variable once and it updates everywhere. Unlike preprocessor variables (Sass/Less), CSS variables are live in the browser, can be scoped to specific elements, and can be updated at runtime via JavaScript. They are also heavily used by CSS frameworks and design systems to manage theming, including dark mode.',
  ARRAY['css-variables', 'custom-properties', 'theming', 'dark-mode', 'design-system'],
  false
),
(
  'css-critical',
  'CSS',
  'hard',
  'How would you implement critical CSS to improve the perceived load time of your web pages?',
  'Critical CSS refers to the minimum CSS required to render the above-the-fold content of a page. To implement it, extract those rules from your stylesheets and inline them directly inside a <style> tag in the <head> of your HTML document. This eliminates the render-blocking network request for that CSS, so the browser can paint the visible content immediately. The remaining non-critical CSS is loaded asynchronously (e.g. using <link rel="preload"> with onload). Tools like Critical, Penthouse, or build plugins for Webpack/Vite can automate the extraction. The tradeoff is increased HTML size, so this technique is most valuable for pages where initial load time is critical to user experience.',
  ARRAY['critical-css', 'performance', 'render-blocking', 'above-the-fold', 'page-load'],
  false
),
(
  'css-border-box',
  'CSS',
  'easy',
  'Explain the difference between the "content-box" and "border-box" CSS box model.',
  'In the default "content-box" model, the width and height properties apply only to the content area. Padding and border are added on top of that, increasing the element''s total rendered size. For example, a div with width: 200px, padding: 20px, and border: 2px would actually be 244px wide. In the "border-box" model (set via box-sizing: border-box), the width and height include the padding and border. That same div would render at exactly 200px wide, with the content area shrinking to accommodate the padding and border. Most modern CSS resets apply box-sizing: border-box to all elements because it makes layout calculations more intuitive and predictable.',
  ARRAY['box-sizing', 'border-box', 'content-box', 'layout', 'css-model'],
  false
);

-- React questions
INSERT INTO questions (id, category, difficulty, question, answer, tags, admin_only) VALUES
(
  'react-useeffect',
  'React',
  'medium',
  'Can you explain the purpose of the React useEffect hook and its dependency array?',
  'useEffect allows you to perform side effects in functional components — things like data fetching, subscriptions, manually changing the DOM, or setting up timers. It runs after the render is committed to the screen. The dependency array controls when the effect re-runs: omitting it runs the effect after every render, an empty array ([]) runs it only once on mount (and the cleanup on unmount), and including specific values runs the effect only when those values change between renders. The hook can optionally return a cleanup function to cancel subscriptions or clear timers when the component unmounts or before the effect re-runs.',
  ARRAY['useeffect', 'hooks', 'side-effects', 'lifecycle', 'dependency-array'],
  false
),
(
  'react-accessibility',
  'React',
  'medium',
  'What is web accessibility (a11y), and how do you ensure your React applications are accessible?',
  'Web accessibility ensures that people with disabilities — visual, motor, auditory, cognitive — can perceive, understand, navigate, and interact with the web. In React, key practices include: using semantic HTML elements (button, nav, main, etc.) instead of generic divs; providing alt text for all images; managing focus explicitly with useRef when navigating between views or opening modals; using ARIA attributes (aria-label, aria-live, role) only when semantic HTML is insufficient; ensuring sufficient color contrast (WCAG AA minimum 4.5:1 for text); supporting full keyboard navigation; and labeling all form inputs. Tools like axe-core, eslint-plugin-jsx-a11y, and Lighthouse can audit components and catch common violations during development.',
  ARRAY['accessibility', 'a11y', 'aria', 'wcag', 'semantic-html', 'keyboard-navigation'],
  false
),
(
  'react-testing',
  'React',
  'medium',
  'How do you approach testing in a front-end application?',
  'I follow a testing pyramid strategy with three layers. Unit tests (using Jest) cover pure logic, utility functions, and isolated component behavior — they are fast and numerous. Integration tests (using React Testing Library) verify how components interact with each other and with state, testing user flows like filling a form and submitting it. End-to-End (E2E) tests (using Playwright or Cypress) cover critical user journeys through the real browser, like login, checkout, or onboarding flows — these are slower and fewer. The key principle is to test behavior rather than implementation details: test what the user sees and does, not internal state or method calls, which makes tests more resilient to refactoring.',
  ARRAY['testing', 'jest', 'react-testing-library', 'playwright', 'cypress', 'unit-test', 'e2e'],
  false
),
(
  'react-state-management',
  'React',
  'hard',
  'Can you walk me through how you handle state management in a large React app?',
  'In large apps I choose the tool based on the type of state. For server state (data fetched from an API), I use React Query or SWR — they handle caching, refetching, and loading/error states automatically, which eliminates a lot of boilerplate. For global UI state that many components need (user auth, theme, feature flags), I use Zustand or Redux Toolkit — Redux scales well because its strict unidirectional data flow and devtools make debugging predictable. For local component state, useState and useReducer are sufficient. Context API is fine for low-frequency updates like theme toggling, but I avoid using it for high-frequency state because every consumer re-renders on every change. The goal is to keep state as local as possible and only elevate it when genuinely needed.',
  ARRAY['state-management', 'redux', 'zustand', 'react-query', 'context-api', 'server-state'],
  false
),
(
  'react-performance',
  'React',
  'hard',
  'How do you optimize performance in a React app?',
  'I approach React performance at several levels. Code splitting: use React.lazy and Suspense to split bundles by route or heavy component, so users only load what they need. Memoization: use React.memo to prevent re-renders of components whose props haven''t changed, useMemo to cache expensive computations, and useCallback to stabilize function references passed as props. Profiling: use the React DevTools Profiler to identify components that render too often or take too long. List virtualization: use react-virtual or react-window for long lists to render only visible rows. Image optimization: lazy load images with loading="lazy" and use next/image for automatic format/size optimization. State co-location: keep state as close to where it''s used as possible to minimize the component subtree that re-renders on changes.',
  ARRAY['performance', 'react-memo', 'usememo', 'code-splitting', 'lazy-loading', 'profiler', 'virtualization'],
  false
),
(
  'react-virtual-dom',
  'React',
  'hard',
  'How does virtual DOM work, and what are its advantages?',
  'The virtual DOM is a lightweight in-memory representation of the actual DOM. When state changes, React creates a new virtual DOM tree and diffs it against the previous version using a reconciliation algorithm. It then calculates the minimum set of changes needed and batches those updates to the real DOM — only the nodes that actually changed are touched. Advantages include: performance optimization (fewer and more targeted DOM mutations reduce reflows and repaints), predictability (the UI is always a function of state, reducing bugs from manual DOM manipulation), and cross-platform portability (the virtual DOM abstraction layer allows React to target environments beyond the browser, such as React Native for mobile).',
  ARRAY['virtual-dom', 'reconciliation', 'diffing', 'react', 'performance', 'rendering'],
  false
);

-- Next.js questions
INSERT INTO questions (id, category, difficulty, question, answer, tags, admin_only) VALUES
(
  'nextjs-ssr-vs-ssg',
  'Next.js',
  'hard',
  'Can you describe how server-side rendering works in Next.js and when to use it versus static generation?',
  'In Next.js, Server-Side Rendering (SSR) pre-renders a page on the server on every request. The server fetches fresh data, generates the HTML, and sends a fully rendered page to the client — improving SEO and ensuring the user always sees up-to-date content. Static Generation (SSG) builds pages at build time: the HTML is generated once and served from a CDN on every request, making it extremely fast. Use SSR when the page content is personalized, user-specific, or changes frequently (e.g. dashboards, feeds, product pages with live inventory). Use SSG for content that rarely changes (e.g. blog posts, marketing pages, documentation). Next.js also offers ISR (Incremental Static Regeneration), which revalidates static pages in the background at a configurable interval — a middle ground between SSR and SSG.',
  ARRAY['nextjs', 'ssr', 'ssg', 'isr', 'static-generation', 'server-side-rendering', 'seo'],
  false
);

-- TypeScript questions
INSERT INTO questions (id, category, difficulty, question, answer, tags, admin_only) VALUES
(
  'ts-why-typescript',
  'TypeScript',
  'medium',
  'Why use TypeScript in a large front-end project instead of plain JavaScript?',
  'TypeScript adds static typing to JavaScript, which brings several concrete benefits at scale. Catch errors early: type errors surface at compile time in the IDE rather than as runtime bugs in production. Better tooling: autocompletion, inline documentation, and reliable refactoring work across the entire codebase because the editor understands types. Self-documenting code: function signatures and interfaces make intent explicit without relying on comments. Safer refactoring: renaming a prop or changing a function signature immediately highlights every call site that needs updating. Easier onboarding: new developers can understand a module''s API by reading its types. The tradeoff is added setup overhead and a learning curve, but for codebases with multiple developers or long maintenance cycles, TypeScript pays for itself quickly.',
  ARRAY['typescript', 'static-typing', 'developer-experience', 'refactoring', 'tooling'],
  false
);

-- Behavioral questions (admin only)
INSERT INTO questions (id, category, difficulty, question, answer, tags, admin_only) VALUES
(
  'behavioral-conflict-resolution',
  'Behavioral',
  'medium',
  'Tell me about a time you resolved a conflict with a teammate.',
  'Use the STAR method: Situation — briefly describe the context and the nature of the disagreement (e.g. differing opinions on technical approach, priorities, or ownership). Task — explain your role and what was at stake. Action — focus on the steps you took: requesting a one-on-one conversation, actively listening to understand their perspective, seeking common ground, and co-developing a compromise. Result — describe the outcome: the solution you reached, how it improved the project, and what you learned about collaboration. Key things interviewers look for: emotional maturity (you stayed professional), empathy (you genuinely heard the other person), and problem-solving mindset (you focused on the work, not the ego).',
  ARRAY['behavioral', 'conflict', 'teamwork', 'communication', 'star-method'],
  true
),
(
  'behavioral-new-tool',
  'Behavioral',
  'medium',
  'Describe a time you had to learn a new front-end tool or technology quickly.',
  'Use the STAR method: Situation — describe the context (e.g. a project required a library or framework you had not used before, with a tight deadline). Task — explain what you needed to deliver and the time constraint. Action — walk through your learning approach: start with official documentation and a minimal working example, build a small prototype to test the core features, then progressively apply it to the real problem. Be specific about the tool and what made it challenging. Result — describe what you shipped, the timeline, and what you would do differently. Interviewers want to see: a structured self-learning process, comfort with ambiguity, and the ability to ramp up without hand-holding.',
  ARRAY['behavioral', 'learning', 'adaptability', 'self-study', 'star-method'],
  true
);
