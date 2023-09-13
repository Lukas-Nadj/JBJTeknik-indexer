
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/header.svelte generated by Svelte v3.59.2 */

    const { console: console_1$3 } = globals;
    const file$4 = "src/header.svelte";

    // (32:12) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Gem");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(32:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:12) {#if loading}
    function create_if_block$2(ctx) {
    	let t;
    	let i;

    	const block = {
    		c: function create() {
    			t = text("Loading\n            ");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-refresh fa-spin");
    			add_location(i, file$4, 30, 12, 1065);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(29:12) {#if loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let head;
    	let link;
    	let t0;
    	let main;
    	let img;
    	let img_src_value;
    	let t1;
    	let div;
    	let p0;
    	let t3;
    	let input;
    	let t4;
    	let button0;
    	let p1;
    	let t6;
    	let button1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[2]) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			head = element("head");
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			img = element("img");
    			t1 = space();
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Søg varenummer";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			button0 = element("button");
    			p1 = element("p");
    			p1.textContent = "Sorter";
    			t6 = space();
    			button1 = element("button");
    			if_block.c();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			add_location(link, file$4, 16, 4, 280);
    			add_location(head, file$4, 15, 0, 269);
    			attr_dev(img, "alt", "Logo");
    			if (!src_url_equal(img.src, img_src_value = "Logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "100%");
    			add_location(img, file$4, 21, 4, 415);
    			set_style(p0, "margin", "0px");
    			add_location(p0, file$4, 23, 8, 492);
    			attr_dev(input, "type", "search");
    			attr_dev(input, "name", "");
    			attr_dev(input, "id", "");
    			attr_dev(input, "placeholder", "f.eks. 120144");
    			add_location(input, file$4, 24, 8, 542);
    			attr_dev(div, "class", "search svelte-1uuzxsl");
    			add_location(div, file$4, 22, 4, 463);
    			set_style(p1, "margin", "0px");
    			set_style(p1, "margin-top", "-1px");
    			set_style(p1, "font-size", "small");
    			add_location(p1, file$4, 26, 112, 750);
    			attr_dev(button0, "class", "but svelte-1uuzxsl");
    			add_location(button0, file$4, 26, 8, 646);
    			attr_dev(button1, "class", "but svelte-1uuzxsl");
    			attr_dev(button1, "id", "save");
    			set_style(button1, "margin", "0px");
    			set_style(button1, "margin-top", "-1px");
    			set_style(button1, "margin-bottom", "8px");
    			set_style(button1, "font-size", "small");
    			set_style(button1, "position", "absolute");
    			set_style(button1, "bottom", "1px");
    			set_style(button1, "height", "2.5em");
    			add_location(button1, file$4, 27, 8, 836);
    			attr_dev(main, "class", "svelte-1uuzxsl");
    			add_location(main, file$4, 20, 0, 404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, img);
    			append_dev(main, t1);
    			append_dev(main, div);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, input);
    			set_input_value(input, /*søgning*/ ctx[0]);
    			append_dev(main, t4);
    			append_dev(main, button0);
    			append_dev(button0, p1);
    			append_dev(main, t6);
    			append_dev(main, button1);
    			if_block.m(button1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false, false),
    					listen_dev(button1, "click", /*save*/ ctx[3], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*søgning*/ 1 && input.value !== /*søgning*/ ctx[0]) {
    				set_input_value(input, /*søgning*/ ctx[0]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { søgning = "" } = $$props;
    	let { varer = [] } = $$props;
    	let loading = false;

    	async function save() {
    		$$invalidate(2, loading = true);
    		console.log(await window.electronApi.SaveToJSON(JSON.stringify(varer)));

    		setTimeout(
    			() => {
    				$$invalidate(2, loading = false);
    			},
    			250
    		);
    	}

    	const writable_props = ['søgning', 'varer'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		søgning = this.value;
    		$$invalidate(0, søgning);
    	}

    	const click_handler = () => {
    		varer.sort((a, b) => a.Varenummer - b.Varenummer);
    		$$invalidate(1, varer);
    	};

    	$$self.$$set = $$props => {
    		if ('søgning' in $$props) $$invalidate(0, søgning = $$props.søgning);
    		if ('varer' in $$props) $$invalidate(1, varer = $$props.varer);
    	};

    	$$self.$capture_state = () => ({ søgning, varer, loading, save });

    	$$self.$inject_state = $$props => {
    		if ('søgning' in $$props) $$invalidate(0, søgning = $$props.søgning);
    		if ('varer' in $$props) $$invalidate(1, varer = $$props.varer);
    		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [søgning, varer, loading, save, input_input_handler, click_handler];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { søgning: 0, varer: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get søgning() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set søgning(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get varer() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set varer(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/footer.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$3 = "src/footer.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let form;
    	let button0;
    	let t1;
    	let div0;
    	let p0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let p1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let p2;
    	let t9;
    	let input2;
    	let t10;
    	let div3;
    	let button1;
    	let t11;
    	let i;
    	let i_class_value;
    	let t12;
    	let p3;
    	let t13;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			form = element("form");
    			button0 = element("button");
    			button0.textContent = "Nyt varenummer";
    			t1 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Varenummer";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Beskrivelse";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			p2 = element("p");
    			p2.textContent = "Pris";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			div3 = element("div");
    			button1 = element("button");
    			t11 = text("Gemte varer \n        ");
    			i = element("i");
    			t12 = space();
    			p3 = element("p");
    			t13 = text(/*path*/ ctx[5]);
    			attr_dev(button0, "type", "submit");
    			attr_dev(button0, "class", "svelte-j1jxn9");
    			add_location(button0, file$3, 22, 4, 417);
    			set_style(p0, "margin", "0px");
    			set_style(p0, "width", "100%");
    			set_style(p0, "min-width", "60px");
    			add_location(p0, file$3, 24, 8, 783);
    			attr_dev(input0, "type", "text");
    			set_style(input0, "width", "100%");
    			set_style(input0, "min-width", "60px");
    			add_location(input0, file$3, 25, 8, 860);
    			set_style(div0, "color", "white");
    			set_style(div0, "margin", "0px");
    			set_style(div0, "padding-right", "10px");
    			set_style(div0, "text-align", "left");
    			set_style(div0, "width", "180px");
    			set_style(div0, "min-width", "95px");
    			add_location(div0, file$3, 23, 4, 666);
    			set_style(p1, "margin", "0px");
    			set_style(p1, "width", "100%");
    			set_style(p1, "min-width", "60px");
    			add_location(p1, file$3, 28, 8, 1066);
    			attr_dev(input1, "type", "text");
    			set_style(input1, "width", "100%");
    			set_style(input1, "min-width", "60px");
    			add_location(input1, file$3, 29, 8, 1144);
    			set_style(div1, "color", "white");
    			set_style(div1, "margin", "0px");
    			set_style(div1, "padding-right", "10px");
    			set_style(div1, "text-align", "left");
    			set_style(div1, "width", "180px");
    			set_style(div1, "min-width", "85px");
    			add_location(div1, file$3, 27, 4, 948);
    			set_style(p2, "margin", "0px");
    			set_style(p2, "width", "100%");
    			set_style(p2, "min-width", "60px");
    			add_location(p2, file$3, 32, 8, 1370);
    			attr_dev(input2, "type", "text");
    			set_style(input2, "width", "100%");
    			set_style(input2, "min-width", "60px");
    			add_location(input2, file$3, 33, 8, 1441);
    			set_style(div2, "color", "white");
    			set_style(div2, "margin", "0px");
    			set_style(div2, "padding-right", "10px");
    			set_style(div2, "text-align", "left");
    			set_style(div2, "margin-right", "auto");
    			set_style(div2, "width", "180px");
    			set_style(div2, "min-width", "60px");
    			add_location(div2, file$3, 31, 4, 1232);
    			set_style(i, "margin", "auto");
    			set_style(i, "margin-left", "10px");
    			attr_dev(i, "class", i_class_value = "arrow " + (/*favoriteVisible*/ ctx[1] ? "up" : "down") + " svelte-j1jxn9");
    			add_location(i, file$3, 38, 8, 1775);
    			attr_dev(button1, "id", "gemte");
    			set_style(button1, "border-radius", "10px");
    			attr_dev(button1, "class", "svelte-j1jxn9");
    			add_location(button1, file$3, 36, 4, 1611);
    			set_style(div3, "justify-self", "flex-end");
    			set_style(div3, "align-self", "flex-end");
    			set_style(div3, "padding-right", "15px");
    			add_location(div3, file$3, 35, 4, 1528);
    			attr_dev(form, "onsubmit", "return false");
    			set_style(form, "display", "flex");
    			set_style(form, "flex-direction", "row");
    			set_style(form, "width", "100%");
    			add_location(form, file$3, 21, 4, 326);
    			set_style(p3, "color", "black");
    			set_style(p3, "position", "absolute");
    			set_style(p3, "bottom", "-35px");
    			set_style(p3, "left", "5px");
    			set_style(p3, "text-align", "left");
    			set_style(p3, "padding", "20px");
    			add_location(p3, file$3, 42, 4, 1912);
    			attr_dev(main, "class", "svelte-j1jxn9");
    			add_location(main, file$3, 20, 0, 315);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, form);
    			append_dev(form, button0);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*vn*/ ctx[2]);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*pn*/ ctx[3]);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, p2);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			set_input_value(input2, /*p*/ ctx[4]);
    			append_dev(form, t10);
    			append_dev(form, div3);
    			append_dev(div3, button1);
    			append_dev(button1, t11);
    			append_dev(button1, i);
    			append_dev(main, t12);
    			append_dev(main, p3);
    			append_dev(p3, t13);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[11], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*vn*/ 4 && input0.value !== /*vn*/ ctx[2]) {
    				set_input_value(input0, /*vn*/ ctx[2]);
    			}

    			if (dirty & /*pn*/ 8 && input1.value !== /*pn*/ ctx[3]) {
    				set_input_value(input1, /*pn*/ ctx[3]);
    			}

    			if (dirty & /*p*/ 16 && input2.value !== /*p*/ ctx[4]) {
    				set_input_value(input2, /*p*/ ctx[4]);
    			}

    			if (dirty & /*favoriteVisible*/ 2 && i_class_value !== (i_class_value = "arrow " + (/*favoriteVisible*/ ctx[1] ? "up" : "down") + " svelte-j1jxn9")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*path*/ 32) set_data_dev(t13, /*path*/ ctx[5]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let path;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	let { varer = [] } = $$props;
    	let { favoriteVisible } = $$props;
    	let vn;
    	let pn;
    	let p;
    	let vare = { Varenummer: vn, Produktnavn: pn, Pris: p };

    	window.electronApi.getPath().then(result => {
    		$$invalidate(5, path = result);
    		$$invalidate(5, path);
    	});

    	$$self.$$.on_mount.push(function () {
    		if (favoriteVisible === undefined && !('favoriteVisible' in $$props || $$self.$$.bound[$$self.$$.props['favoriteVisible']])) {
    			console.warn("<Footer> was created without expected prop 'favoriteVisible'");
    		}
    	});

    	const writable_props = ['varer', 'favoriteVisible'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		let vare = { Varenummer: vn, Produktnavn: pn, Pris: p };
    		varer.push(Object.assign({}, vare));
    		varer.sort((a, b) => a.Varenummer - b.Varenummer);
    		$$invalidate(0, varer);
    		$$invalidate(2, vn = "");
    		$$invalidate(3, pn = "");
    		$$invalidate(4, p = "");
    	};

    	function input0_input_handler() {
    		vn = this.value;
    		$$invalidate(2, vn);
    	}

    	function input1_input_handler() {
    		pn = this.value;
    		$$invalidate(3, pn);
    	}

    	function input2_input_handler() {
    		p = this.value;
    		$$invalidate(4, p);
    	}

    	const click_handler_1 = () => {
    		$$invalidate(1, favoriteVisible = !favoriteVisible);
    		$$invalidate(1, favoriteVisible);
    	};

    	$$self.$$set = $$props => {
    		if ('varer' in $$props) $$invalidate(0, varer = $$props.varer);
    		if ('favoriteVisible' in $$props) $$invalidate(1, favoriteVisible = $$props.favoriteVisible);
    	};

    	$$self.$capture_state = () => ({
    		varer,
    		favoriteVisible,
    		vn,
    		pn,
    		p,
    		vare,
    		path
    	});

    	$$self.$inject_state = $$props => {
    		if ('varer' in $$props) $$invalidate(0, varer = $$props.varer);
    		if ('favoriteVisible' in $$props) $$invalidate(1, favoriteVisible = $$props.favoriteVisible);
    		if ('vn' in $$props) $$invalidate(2, vn = $$props.vn);
    		if ('pn' in $$props) $$invalidate(3, pn = $$props.pn);
    		if ('p' in $$props) $$invalidate(4, p = $$props.p);
    		if ('vare' in $$props) $$invalidate(6, vare = $$props.vare);
    		if ('path' in $$props) $$invalidate(5, path = $$props.path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*vare*/ 64) {
    			$$invalidate(6, vare);
    		}
    	};

    	$$invalidate(5, path = undefined);

    	return [
    		varer,
    		favoriteVisible,
    		vn,
    		pn,
    		p,
    		path,
    		vare,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler_1
    	];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { varer: 0, favoriteVisible: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get varer() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set varer(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get favoriteVisible() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set favoriteVisible(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Fileviewer.svelte generated by Svelte v3.59.2 */

    const { console: console_1$2 } = globals;
    const file$2 = "src/Components/Fileviewer.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let if_block1_anchor;
    	let if_block0 = /*images*/ ctx[0].length > 0 && create_if_block_4(ctx);
    	let each_value = /*images*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*image*/ ctx[8].src;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	let if_block1 = /*images*/ ctx[0].length === 0 && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*images*/ ctx[0].length > 0) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*viewFile, images, deletefile, path, window, console, imgfile*/ 29) {
    				each_value = /*images*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, t1.parentNode, destroy_block, create_each_block$2, t1, get_each_context$2);
    			}

    			if (/*images*/ ctx[0].length === 0) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if loading}
    function create_if_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "loader billeder...";
    			add_location(p, file$2, 41, 4, 1011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(41:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (44:2) {#if images.length>0}
    function create_if_block_4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tryk på PDF ell. billede for at åbne";
    			set_style(p, "position", "absolute");
    			set_style(p, "top", "-10px");
    			set_style(p, "left", "10px");
    			add_location(p, file$2, 44, 4, 1075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(44:2) {#if images.length>0}",
    		ctx
    	});

    	return block;
    }

    // (57:10) {:else}
    function create_else_block_1(ctx) {
    	let p;
    	let t_value = /*image*/ ctx[8].src.split('.').pop() + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "billede svelte-jwwob3");
    			set_style(p, "position", "relative");
    			set_style(p, "width", "5vw");
    			set_style(p, "margin", "5px");
    			set_style(p, "margin-left", "-2px");
    			set_style(p, "background-color", "black");
    			set_style(p, "color", "white");
    			set_style(p, "border-radius", "3px");
    			add_location(p, file$2, 57, 10, 1857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 1 && t_value !== (t_value = /*image*/ ctx[8].src.split('.').pop() + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(57:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:39) 
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "width", "100px");
    			set_style(img, "max-width", "100px");
    			attr_dev(img, "draggable", "false");
    			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[8].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = console.log(/*image*/ ctx[8].src));
    			attr_dev(img, "class", "billede svelte-jwwob3");
    			add_location(img, file$2, 55, 10, 1703);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 1 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[8].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*images*/ 1 && img_alt_value !== (img_alt_value = console.log(/*image*/ ctx[8].src))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(55:39) ",
    		ctx
    	});

    	return block;
    }

    // (53:10) {#if image.src.toLowerCase().endsWith(".pdf")}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "draggable", "false");
    			set_style(img, "position", "relative");
    			set_style(img, "right", "1%");
    			if (!src_url_equal(img.src, img_src_value = "../pdf-file-placeholder.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = console.log(/*image*/ ctx[8].src));
    			attr_dev(img, "class", "billede pdf svelte-jwwob3");
    			add_location(img, file$2, 53, 12, 1508);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 1 && img_alt_value !== (img_alt_value = console.log(/*image*/ ctx[8].src))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(53:10) {#if image.src.toLowerCase().endsWith(\\\".pdf\\\")}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let images;   export let loading;    async function deletefile(imagename) {     let success = window.electronApi.deleteFile(imagename);     if (success) {       for (let i = 0; i < images.length; i++) {         if (images[i].name === imagename) {           console.log(images[i]);           console.log("found it, deleting it", i, images[i].name, imagename);           images.splice(i, 1);           images = images;         }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   export let images;   export let loading;    async function deletefile(imagename) {     let success = window.electronApi.deleteFile(imagename);     if (success) {       for (let i = 0; i < images.length; i++) {         if (images[i].name === imagename) {           console.log(images[i]);           console.log(\\\"found it, deleting it\\\", i, images[i].name, imagename);           images.splice(i, 1);           images = images;         }",
    		ctx
    	});

    	return block;
    }

    // (62:35)            <p style="position:relative; top: 40%; margin: 0px; font-size: smaller">{image.name.slice((result+"/data/"+window.productName+"/").length)}
    function create_then_block(ctx) {
    	let p;
    	let t_value = /*image*/ ctx[8].name.slice((/*result*/ ctx[11] + "/data/" + window.productName + "/").length) + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "position", "relative");
    			set_style(p, "top", "40%");
    			set_style(p, "margin", "0px");
    			set_style(p, "font-size", "smaller");
    			add_location(p, file$2, 62, 10, 2251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 1 && t_value !== (t_value = /*image*/ ctx[8].name.slice((/*result*/ ctx[11] + "/data/" + window.productName + "/").length) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(62:35)            <p style=\\\"position:relative; top: 40%; margin: 0px; font-size: smaller\\\">{image.name.slice((result+\\\"/data/\\\"+window.productName+\\\"/\\\").length)}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let images;   export let loading;    async function deletefile(imagename) {     let success = window.electronApi.deleteFile(imagename);     if (success) {       for (let i = 0; i < images.length; i++) {         if (images[i].name === imagename) {           console.log(images[i]);           console.log("found it, deleting it", i, images[i].name, imagename);           images.splice(i, 1);           images = images;         }
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>   export let images;   export let loading;    async function deletefile(imagename) {     let success = window.electronApi.deleteFile(imagename);     if (success) {       for (let i = 0; i < images.length; i++) {         if (images[i].name === imagename) {           console.log(images[i]);           console.log(\\\"found it, deleting it\\\", i, images[i].name, imagename);           images.splice(i, 1);           images = images;         }",
    		ctx
    	});

    	return block;
    }

    // (48:4) {#each images as image (image.src)}
    function create_each_block$2(key_1, ctx) {
    	let div1;
    	let div0;
    	let show_if;
    	let show_if_1;
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*images*/ 1) show_if = null;
    		if (dirty & /*images*/ 1) show_if_1 = null;
    		if (show_if == null) show_if = !!/*image*/ ctx[8].src.toLowerCase().endsWith(".pdf");
    		if (show_if) return create_if_block_2;
    		if (show_if_1 == null) show_if_1 = !!/*imgfile*/ ctx[4](/*image*/ ctx[8].src);
    		if (show_if_1) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx, -1);
    	let if_block = current_block_type(ctx);

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 11
    	};

    	handle_promise(/*path*/ ctx[3], info);

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*image*/ ctx[8]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[6](/*image*/ ctx[8]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			info.block.c();
    			t1 = space();
    			button = element("button");
    			button.textContent = "slet";
    			attr_dev(button, "id", "del");
    			set_style(button, "background-color", "white");
    			set_style(button, "position", "absolute");
    			set_style(button, "width", "40px");
    			set_style(button, "right", "0px");
    			set_style(button, "text-align", "left");
    			set_style(button, "bottom", "0px");
    			set_style(button, "margin", "0px");
    			set_style(button, "font-size", "smaller");
    			add_location(button, file$2, 67, 10, 2437);
    			attr_dev(div0, "class", "img svelte-jwwob3");
    			add_location(div0, file$2, 51, 8, 1421);
    			attr_dev(div1, "class", "Preview svelte-jwwob3");
    			add_location(div1, file$2, 49, 6, 1289);
    			this.first = div1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block.m(div0, null);
    			append_dev(div0, t0);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = t1;
    			append_dev(div0, t1);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", click_handler, false, false, false, false),
    					listen_dev(div1, "click", click_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, t0);
    				}
    			}

    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(48:4) {#each images as image (image.src)}",
    		ctx
    	});

    	return block;
    }

    // (78:4) {#if images.length===0}
    function create_if_block_1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Ingen filer endnu";
    			if (!src_url_equal(img.src, img_src_value = "../not-found.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "200px");
    			set_style(img, "cursor-events", "none");
    			attr_dev(img, "draggable", "false");
    			add_location(img, file$2, 79, 6, 2825);
    			set_style(p, "margin", "0px");
    			add_location(p, file$2, 80, 6, 2927);
    			attr_dev(div, "class", "center");
    			add_location(div, file$2, 78, 4, 2798);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(78:4) {#if images.length===0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[1]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-jwwob3");
    			add_location(main, file$2, 39, 0, 984);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function viewFile(src) {
    	window.electronApi.openFile(src);
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fileviewer', slots, []);
    	let { images } = $$props;
    	let { loading } = $$props;

    	async function deletefile(imagename) {
    		let success = window.electronApi.deleteFile(imagename);

    		if (success) {
    			for (let i = 0; i < images.length; i++) {
    				if (images[i].name === imagename) {
    					console.log(images[i]);
    					console.log("found it, deleting it", i, images[i].name, imagename);
    					images.splice(i, 1);
    					$$invalidate(0, images);
    				}
    			}
    		} else {
    			console.log(success);
    		}
    	}

    	let path = window.electronApi.getPath();

    	const imageExtensions = [
    		".apng",
    		".avif",
    		".bmp",
    		".gif",
    		".ico",
    		".cur",
    		".jpg",
    		".jpeg",
    		".jfif",
    		".pjpeg",
    		".pjp",
    		".png",
    		".svg",
    		".webp"
    	];

    	function imgfile(str) {
    		for (let i = 0; i < imageExtensions.length; i++) {
    			if (str.endsWith(imageExtensions[i])) {
    				console.log("true");
    				return true;
    			}
    		}

    		return false;
    	}

    	$$self.$$.on_mount.push(function () {
    		if (images === undefined && !('images' in $$props || $$self.$$.bound[$$self.$$.props['images']])) {
    			console_1$2.warn("<Fileviewer> was created without expected prop 'images'");
    		}

    		if (loading === undefined && !('loading' in $$props || $$self.$$.bound[$$self.$$.props['loading']])) {
    			console_1$2.warn("<Fileviewer> was created without expected prop 'loading'");
    		}
    	});

    	const writable_props = ['images', 'loading'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Fileviewer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = image => {
    		deletefile(image.name);
    	};

    	const click_handler_1 = image => {
    		viewFile(image.src);
    	};

    	$$self.$$set = $$props => {
    		if ('images' in $$props) $$invalidate(0, images = $$props.images);
    		if ('loading' in $$props) $$invalidate(1, loading = $$props.loading);
    	};

    	$$self.$capture_state = () => ({
    		images,
    		loading,
    		deletefile,
    		path,
    		imageExtensions,
    		imgfile,
    		viewFile
    	});

    	$$self.$inject_state = $$props => {
    		if ('images' in $$props) $$invalidate(0, images = $$props.images);
    		if ('loading' in $$props) $$invalidate(1, loading = $$props.loading);
    		if ('path' in $$props) $$invalidate(3, path = $$props.path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [images, loading, deletefile, path, imgfile, click_handler, click_handler_1];
    }

    class Fileviewer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { images: 0, loading: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fileviewer",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get images() {
    		throw new Error("<Fileviewer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Fileviewer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Fileviewer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Fileviewer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Table.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/Components/Table.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (42:2) {#if favoriteVisible}
    function create_if_block(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t2;
    	let th2;
    	let t3;
    	let th3;
    	let t4;
    	let th4;
    	let t5;
    	let th5;
    	let t6;
    	let tbody;
    	let table_intro;
    	let table_outro;
    	let current;
    	let each_value = /*checkedVarer*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Gemte";
    			t1 = space();
    			th1 = element("th");
    			t2 = space();
    			th2 = element("th");
    			t3 = space();
    			th3 = element("th");
    			t4 = space();
    			th4 = element("th");
    			t5 = space();
    			th5 = element("th");
    			t6 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(th0, "width", "55px");
    			add_location(th0, file$1, 45, 12, 1760);
    			set_style(th1, "width", "160px");
    			add_location(th1, file$1, 46, 12, 1808);
    			add_location(th2, file$1, 47, 12, 1852);
    			set_style(th3, "width", "160px");
    			add_location(th3, file$1, 48, 12, 1874);
    			set_style(th4, "width", "160px");
    			add_location(th4, file$1, 49, 12, 1918);
    			set_style(th5, "width", "35px");
    			add_location(th5, file$1, 50, 12, 1959);
    			set_style(tr, "position", "sticky");
    			set_style(tr, "top", "0px");
    			set_style(tr, "height", "30px");
    			set_style(tr, "overflow", "hidden");
    			set_style(tr, "background-color", "#2B2F42");
    			set_style(tr, "color", "white");
    			add_location(tr, file$1, 44, 10, 1636);
    			set_style(thead, "border-radius", "15px");
    			add_location(thead, file$1, 43, 8, 1590);
    			add_location(tbody, file$1, 53, 8, 2031);
    			set_style(table, "width", "100%");
    			set_style(table, "text-align", "center");
    			set_style(table, "border-collapse", "separate", 1);
    			set_style(table, "margin", "0px");
    			set_style(table, "background-color", "#f5f5f5");
    			attr_dev(table, "cellspacing", "0");
    			attr_dev(table, "class", "svelte-y0g4st");
    			add_location(table, file$1, 42, 4, 1366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t2);
    			append_dev(tr, th2);
    			append_dev(tr, t3);
    			append_dev(tr, th3);
    			append_dev(tr, t4);
    			append_dev(tr, th4);
    			append_dev(tr, t5);
    			append_dev(tr, th5);
    			append_dev(table, t6);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tbody, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*varer, imagegallery, checkedVarer*/ 13) {
    				each_value = /*checkedVarer*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!current) return;
    				if (table_outro) table_outro.end(1);
    				table_intro = create_in_transition(table, fly, { y: '100%', duration: 180 });
    				table_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (table_intro) table_intro.invalidate();
    			table_outro = create_out_transition(table, fly, { y: '100%', duration: 180 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching && table_outro) table_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(42:2) {#if favoriteVisible}",
    		ctx
    	});

    	return block;
    }

    // (55:10) {#each checkedVarer as item, i}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let input0;
    	let t0;
    	let td1;
    	let input1;
    	let t1;
    	let td2;
    	let input2;
    	let t2;
    	let td3;
    	let input3;
    	let t3;
    	let td4;
    	let a;
    	let t5;
    	let td5;
    	let button;
    	let button_src_value;
    	let t6;
    	let mounted;
    	let dispose;

    	function input0_change_handler() {
    		/*input0_change_handler*/ ctx[6].call(input0, /*each_value*/ ctx[14], /*i*/ ctx[15]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[7].call(input1, /*each_value*/ ctx[14], /*i*/ ctx[15]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[8].call(input2, /*each_value*/ ctx[14], /*i*/ ctx[15]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[9].call(input3, /*each_value*/ ctx[14], /*i*/ ctx[15]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*item*/ ctx[13]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[11](/*i*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t0 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t1 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t2 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t3 = space();
    			td4 = element("td");
    			a = element("a");
    			a.textContent = "Se Billeder";
    			t5 = space();
    			td5 = element("td");
    			button = element("button");
    			t6 = space();
    			set_style(input0, "margin", "auto");
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "name", "");
    			attr_dev(input0, "id", "");
    			add_location(input0, file$1, 56, 113, 2271);
    			set_style(td0, "display", "flex");
    			set_style(td0, "justify-content", "center");
    			set_style(td0, "align-items", "center");
    			set_style(td0, "width", "100%");
    			set_style(td0, "height", "100%");
    			add_location(td0, file$1, 56, 14, 2172);
    			attr_dev(input1, "type", "text");
    			set_style(input1, "all", "unset");
    			set_style(input1, "width", "100%");
    			set_style(input1, "height", "100%");
    			set_style(input1, "margin", "0px");
    			set_style(input1, "background", "none");
    			add_location(input1, file$1, 57, 61, 2425);
    			set_style(td1, "color", "#373A86");
    			set_style(td1, "font-weight", "3000");
    			add_location(td1, file$1, 57, 14, 2378);
    			attr_dev(input2, "type", "text");
    			set_style(input2, "all", "unset");
    			set_style(input2, "width", "100%");
    			set_style(input2, "height", "100%");
    			set_style(input2, "margin", "0px");
    			set_style(input2, "background", "none");
    			add_location(input2, file$1, 58, 61, 2618);
    			set_style(td2, "font-weight", "500");
    			set_style(td2, "text-align", "left");
    			add_location(td2, file$1, 58, 14, 2571);
    			attr_dev(input3, "type", "text");
    			set_style(input3, "all", "unset");
    			set_style(input3, "width", "100%");
    			set_style(input3, "height", "100%");
    			set_style(input3, "margin", "0px");
    			set_style(input3, "background", "none");
    			add_location(input3, file$1, 59, 44, 2795);
    			set_style(td3, "text-align", "center");
    			add_location(td3, file$1, 59, 14, 2765);
    			attr_dev(a, "href", "#");
    			add_location(a, file$1, 62, 16, 3043);
    			set_style(td4, "text-align", "center");
    			add_location(td4, file$1, 61, 14, 2995);
    			if (!src_url_equal(button.src, button_src_value = "../public/trash_icon.png")) attr_dev(button, "src", button_src_value);
    			set_style(button, "margin", "0px");
    			set_style(button, "box-sizing", "border-box ");
    			set_style(button, "width", "25px");
    			set_style(button, "height", "25px");
    			set_style(button, "padding", "3px");
    			set_style(button, "background-color", "#0F142D");
    			set_style(button, "border-radius", "24px");
    			add_location(button, file$1, 71, 17, 3383);
    			set_style(td5, "display", "flex");
    			set_style(td5, "justify-content", "center");
    			set_style(td5, "align-items", "center");
    			set_style(td5, "margin", "0px");
    			set_style(td5, "height", "30px");
    			add_location(td5, file$1, 70, 14, 3267);
    			set_style(tr, "height", "35px");
    			attr_dev(tr, "class", "" + (null_to_empty(/*i*/ ctx[15] % 2 === 0 ? "odd" : "even") + " svelte-y0g4st"));
    			add_location(tr, file$1, 55, 12, 2093);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			input0.checked = /*item*/ ctx[13].checked;
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*item*/ ctx[13].Varenummer);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*item*/ ctx[13].Produktnavn);
    			append_dev(tr, t2);
    			append_dev(tr, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*item*/ ctx[13].Pris);
    			append_dev(tr, t3);
    			append_dev(tr, td4);
    			append_dev(td4, a);
    			append_dev(tr, t5);
    			append_dev(tr, td5);
    			append_dev(td5, button);
    			append_dev(tr, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", input0_change_handler),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input2, "input", input2_input_handler),
    					listen_dev(input3, "input", input3_input_handler),
    					listen_dev(a, "click", click_handler, false, false, false, false),
    					listen_dev(button, "click", click_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*checkedVarer*/ 4) {
    				input0.checked = /*item*/ ctx[13].checked;
    			}

    			if (dirty & /*checkedVarer*/ 4 && input1.value !== /*item*/ ctx[13].Varenummer) {
    				set_input_value(input1, /*item*/ ctx[13].Varenummer);
    			}

    			if (dirty & /*checkedVarer*/ 4 && input2.value !== /*item*/ ctx[13].Produktnavn) {
    				set_input_value(input2, /*item*/ ctx[13].Produktnavn);
    			}

    			if (dirty & /*checkedVarer*/ 4 && input3.value !== /*item*/ ctx[13].Pris) {
    				set_input_value(input3, /*item*/ ctx[13].Pris);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(55:10) {#each checkedVarer as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let main_style_value;
    	let current;
    	let if_block = /*favoriteVisible*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();

    			attr_dev(main, "style", main_style_value = /*favoriteVisible*/ ctx[1]
    			? 'background-color: #fff;'
    			: 'pointer-events:none');

    			attr_dev(main, "class", "svelte-y0g4st");
    			add_location(main, file$1, 40, 0, 1253);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*favoriteVisible*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*favoriteVisible*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*favoriteVisible*/ 2 && main_style_value !== (main_style_value = /*favoriteVisible*/ ctx[1]
    			? 'background-color: #fff;'
    			: 'pointer-events:none')) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let hidden;
    	let checkedVarer;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Table', slots, []);
    	let { varer } = $$props;
    	let { favoriteVisible } = $$props;
    	let { loading } = $$props;
    	let { images } = $$props;

    	async function imagegallery(vn) {
    		const dialogElement = document.getElementById("billeder");
    		window.productName = vn.toString();
    		dialogElement.showModal();

    		try {
    			$$invalidate(4, loading = true);

    			if (productName === "") {
    				productName = " ";
    			}

    			const imageNames = await window.electronApi.getProductImages(productName);
    			$$invalidate(4, loading = false);

    			if (imageNames && imageNames.length > 0) {
    				console.log(imageNames);
    				$$invalidate(5, images = imageNames.map(imageName => ({ name: imageName, src: imageName })));
    			} else {
    				console.warn("No images found for the specified product.");
    				$$invalidate(5, images = []);
    				$$invalidate(4, loading = false);
    			}
    		} catch(error) {
    			console.error("Error loading images:", error);
    			$$invalidate(4, loading = false);
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (varer === undefined && !('varer' in $$props || $$self.$$.bound[$$self.$$.props['varer']])) {
    			console_1$1.warn("<Table> was created without expected prop 'varer'");
    		}

    		if (favoriteVisible === undefined && !('favoriteVisible' in $$props || $$self.$$.bound[$$self.$$.props['favoriteVisible']])) {
    			console_1$1.warn("<Table> was created without expected prop 'favoriteVisible'");
    		}

    		if (loading === undefined && !('loading' in $$props || $$self.$$.bound[$$self.$$.props['loading']])) {
    			console_1$1.warn("<Table> was created without expected prop 'loading'");
    		}

    		if (images === undefined && !('images' in $$props || $$self.$$.bound[$$self.$$.props['images']])) {
    			console_1$1.warn("<Table> was created without expected prop 'images'");
    		}
    	});

    	const writable_props = ['varer', 'favoriteVisible', 'loading', 'images'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler(each_value, i) {
    		each_value[i].checked = this.checked;
    		($$invalidate(2, checkedVarer), $$invalidate(0, varer));
    	}

    	function input1_input_handler(each_value, i) {
    		each_value[i].Varenummer = this.value;
    		($$invalidate(2, checkedVarer), $$invalidate(0, varer));
    	}

    	function input2_input_handler(each_value, i) {
    		each_value[i].Produktnavn = this.value;
    		($$invalidate(2, checkedVarer), $$invalidate(0, varer));
    	}

    	function input3_input_handler(each_value, i) {
    		each_value[i].Pris = this.value;
    		($$invalidate(2, checkedVarer), $$invalidate(0, varer));
    	}

    	const click_handler = item => {
    		imagegallery(item.Varenummer);
    	};

    	const click_handler_1 = i => {
    		varer.splice(i, 1);
    		$$invalidate(0, varer);
    	};

    	$$self.$$set = $$props => {
    		if ('varer' in $$props) $$invalidate(0, varer = $$props.varer);
    		if ('favoriteVisible' in $$props) $$invalidate(1, favoriteVisible = $$props.favoriteVisible);
    		if ('loading' in $$props) $$invalidate(4, loading = $$props.loading);
    		if ('images' in $$props) $$invalidate(5, images = $$props.images);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		varer,
    		favoriteVisible,
    		loading,
    		images,
    		imagegallery,
    		checkedVarer,
    		hidden
    	});

    	$$self.$inject_state = $$props => {
    		if ('varer' in $$props) $$invalidate(0, varer = $$props.varer);
    		if ('favoriteVisible' in $$props) $$invalidate(1, favoriteVisible = $$props.favoriteVisible);
    		if ('loading' in $$props) $$invalidate(4, loading = $$props.loading);
    		if ('images' in $$props) $$invalidate(5, images = $$props.images);
    		if ('checkedVarer' in $$props) $$invalidate(2, checkedVarer = $$props.checkedVarer);
    		if ('hidden' in $$props) hidden = $$props.hidden;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*favoriteVisible*/ 2) {
    			hidden = !favoriteVisible;
    		}

    		if ($$self.$$.dirty & /*varer*/ 1) {
    			$$invalidate(2, checkedVarer = varer.filter(vare => vare.checked === true));
    		}
    	};

    	return [
    		varer,
    		favoriteVisible,
    		checkedVarer,
    		imagegallery,
    		loading,
    		images,
    		input0_change_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			varer: 0,
    			favoriteVisible: 1,
    			loading: 4,
    			images: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get varer() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set varer(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get favoriteVisible() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set favoriteVisible(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get images() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1, console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[30] = list;
    	child_ctx[31] = i;
    	return child_ctx;
    }

    // (132:12) {#each visibleVarer as vare, i}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let input0;
    	let t0;
    	let td1;
    	let input1;
    	let t1;
    	let td2;
    	let input2;
    	let t2;
    	let td3;
    	let input3;
    	let t3;
    	let td4;
    	let a;
    	let t5;
    	let td5;
    	let button;
    	let button_src_value;
    	let t6;
    	let tr_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function input0_change_handler() {
    		/*input0_change_handler*/ ctx[10].call(input0, /*each_value*/ ctx[30], /*i*/ ctx[31]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[11].call(input1, /*each_value*/ ctx[30], /*i*/ ctx[31]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[12].call(input2, /*each_value*/ ctx[30], /*i*/ ctx[31]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[13].call(input3, /*each_value*/ ctx[30], /*i*/ ctx[31]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*vare*/ ctx[7]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*i*/ ctx[31]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t0 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t1 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t2 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t3 = space();
    			td4 = element("td");
    			a = element("a");
    			a.textContent = "Se Billeder";
    			t5 = space();
    			td5 = element("td");
    			button = element("button");
    			t6 = space();
    			set_style(input0, "margin", "auto");
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "name", "");
    			attr_dev(input0, "id", "");
    			add_location(input0, file, 133, 104, 4034);
    			set_style(td0, "display", "flex");
    			set_style(td0, "justify-content", "center");
    			set_style(td0, "align-items", "center");
    			set_style(td0, "width", "100%");
    			set_style(td0, "height", "100%");
    			add_location(td0, file, 133, 4, 3934);
    			attr_dev(input1, "type", "text");
    			set_style(input1, "all", "unset");
    			set_style(input1, "width", "100%");
    			set_style(input1, "height", "100%");
    			set_style(input1, "margin", "0px");
    			set_style(input1, "background", "none");
    			add_location(input1, file, 134, 63, 4190);
    			set_style(td1, "color", "#373A86");
    			set_style(td1, "font-weight", "3000");
    			add_location(td1, file, 134, 16, 4143);
    			attr_dev(input2, "type", "text");
    			set_style(input2, "all", "unset");
    			set_style(input2, "width", "100%");
    			set_style(input2, "height", "100%");
    			set_style(input2, "margin", "0px");
    			set_style(input2, "background", "none");
    			add_location(input2, file, 135, 63, 4385);
    			set_style(td2, "font-weight", "500");
    			set_style(td2, "text-align", "left");
    			add_location(td2, file, 135, 16, 4338);
    			attr_dev(input3, "type", "text");
    			set_style(input3, "all", "unset");
    			set_style(input3, "width", "100%");
    			set_style(input3, "height", "100%");
    			set_style(input3, "margin", "0px");
    			set_style(input3, "background", "none");
    			add_location(input3, file, 136, 46, 4564);
    			set_style(td3, "text-align", "center");
    			add_location(td3, file, 136, 16, 4534);
    			attr_dev(a, "href", "#");
    			add_location(a, file, 139, 18, 4818);
    			set_style(td4, "text-align", "center");
    			add_location(td4, file, 138, 16, 4768);
    			if (!src_url_equal(button.src, button_src_value = "../public/trash_icon.png")) attr_dev(button, "src", button_src_value);
    			set_style(button, "margin", "0px");
    			set_style(button, "box-sizing", "border-box ");
    			set_style(button, "width", "15px");
    			set_style(button, "height", "15px");
    			set_style(button, "padding", "3px");
    			set_style(button, "padding-bottom", "0px");
    			set_style(button, "background-color", "#751201");
    			set_style(button, "border-radius", "24px");
    			add_location(button, file, 148, 19, 5176);
    			set_style(td5, "display", "flex");
    			set_style(td5, "justify-content", "center");
    			set_style(td5, "align-items", "center");
    			set_style(td5, "margin", "0px");
    			set_style(td5, "height", "30px");
    			add_location(td5, file, 147, 16, 5058);
    			set_style(tr, "height", "35px");
    			attr_dev(tr, "class", "" + (null_to_empty(/*i*/ ctx[31] % 2 === 0 ? "odd" : "even") + " svelte-1jn24uk"));
    			add_location(tr, file, 132, 14, 3831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			input0.checked = /*vare*/ ctx[7].checked;
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*vare*/ ctx[7].Varenummer);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*vare*/ ctx[7].Produktnavn);
    			append_dev(tr, t2);
    			append_dev(tr, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*vare*/ ctx[7].Pris);
    			append_dev(tr, t3);
    			append_dev(tr, td4);
    			append_dev(td4, a);
    			append_dev(tr, t5);
    			append_dev(tr, td5);
    			append_dev(td5, button);
    			append_dev(tr, t6);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", input0_change_handler),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input2, "input", input2_input_handler),
    					listen_dev(input3, "input", input3_input_handler),
    					listen_dev(a, "click", click_handler, false, false, false, false),
    					listen_dev(button, "click", click_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*visibleVarer*/ 16) {
    				input0.checked = /*vare*/ ctx[7].checked;
    			}

    			if (dirty[0] & /*visibleVarer*/ 16 && input1.value !== /*vare*/ ctx[7].Varenummer) {
    				set_input_value(input1, /*vare*/ ctx[7].Varenummer);
    			}

    			if (dirty[0] & /*visibleVarer*/ 16 && input2.value !== /*vare*/ ctx[7].Produktnavn) {
    				set_input_value(input2, /*vare*/ ctx[7].Produktnavn);
    			}

    			if (dirty[0] & /*visibleVarer*/ 16 && input3.value !== /*vare*/ ctx[7].Pris) {
    				set_input_value(input3, /*vare*/ ctx[7].Pris);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!current) return;
    				if (!tr_transition) tr_transition = create_bidirectional_transition(tr, fade, { duration: 80 }, true);
    				tr_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!tr_transition) tr_transition = create_bidirectional_transition(tr, fade, { duration: 80 }, false);
    			tr_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (detaching && tr_transition) tr_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(132:12) {#each visibleVarer as vare, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let t0;
    	let div2;
    	let header;
    	let updating_søgning;
    	let updating_varer;
    	let t1;
    	let div1;
    	let div0;
    	let table0;
    	let thead;
    	let tr;
    	let th0;
    	let t2;
    	let th1;
    	let t4;
    	let th2;
    	let t6;
    	let th3;
    	let t8;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let t12;
    	let table1;
    	let updating_favoriteVisible;
    	let updating_loading;
    	let updating_images;
    	let updating_varer_1;
    	let t13;
    	let footer;
    	let updating_varer_2;
    	let updating_favoriteVisible_1;
    	let t14;
    	let dialog;
    	let div3;
    	let fileviewer;
    	let updating_images_1;
    	let updating_loading_1;
    	let t15;
    	let script0;
    	let t17;
    	let script1;
    	let script1_src_value;
    	let current;

    	function header_søgning_binding(value) {
    		/*header_søgning_binding*/ ctx[8](value);
    	}

    	function header_varer_binding(value) {
    		/*header_varer_binding*/ ctx[9](value);
    	}

    	let header_props = {};

    	if (/*søgning*/ ctx[1] !== void 0) {
    		header_props.søgning = /*søgning*/ ctx[1];
    	}

    	if (/*varer*/ ctx[0] !== void 0) {
    		header_props.varer = /*varer*/ ctx[0];
    	}

    	header = new Header({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, 'søgning', header_søgning_binding));
    	binding_callbacks.push(() => bind(header, 'varer', header_varer_binding));
    	let each_value = /*visibleVarer*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function table1_favoriteVisible_binding(value) {
    		/*table1_favoriteVisible_binding*/ ctx[16](value);
    	}

    	function table1_loading_binding(value) {
    		/*table1_loading_binding*/ ctx[17](value);
    	}

    	function table1_images_binding(value) {
    		/*table1_images_binding*/ ctx[18](value);
    	}

    	function table1_varer_binding(value) {
    		/*table1_varer_binding*/ ctx[19](value);
    	}

    	let table1_props = {};

    	if (/*favoriteVisible*/ ctx[5] !== void 0) {
    		table1_props.favoriteVisible = /*favoriteVisible*/ ctx[5];
    	}

    	if (/*loading*/ ctx[3] !== void 0) {
    		table1_props.loading = /*loading*/ ctx[3];
    	}

    	if (/*images*/ ctx[2] !== void 0) {
    		table1_props.images = /*images*/ ctx[2];
    	}

    	if (/*varer*/ ctx[0] !== void 0) {
    		table1_props.varer = /*varer*/ ctx[0];
    	}

    	table1 = new Table({ props: table1_props, $$inline: true });
    	binding_callbacks.push(() => bind(table1, 'favoriteVisible', table1_favoriteVisible_binding));
    	binding_callbacks.push(() => bind(table1, 'loading', table1_loading_binding));
    	binding_callbacks.push(() => bind(table1, 'images', table1_images_binding));
    	binding_callbacks.push(() => bind(table1, 'varer', table1_varer_binding));

    	function footer_varer_binding(value) {
    		/*footer_varer_binding*/ ctx[20](value);
    	}

    	function footer_favoriteVisible_binding(value) {
    		/*footer_favoriteVisible_binding*/ ctx[21](value);
    	}

    	let footer_props = {};

    	if (/*varer*/ ctx[0] !== void 0) {
    		footer_props.varer = /*varer*/ ctx[0];
    	}

    	if (/*favoriteVisible*/ ctx[5] !== void 0) {
    		footer_props.favoriteVisible = /*favoriteVisible*/ ctx[5];
    	}

    	footer = new Footer({ props: footer_props, $$inline: true });
    	binding_callbacks.push(() => bind(footer, 'varer', footer_varer_binding));
    	binding_callbacks.push(() => bind(footer, 'favoriteVisible', footer_favoriteVisible_binding));

    	function fileviewer_images_binding(value) {
    		/*fileviewer_images_binding*/ ctx[22](value);
    	}

    	function fileviewer_loading_binding(value) {
    		/*fileviewer_loading_binding*/ ctx[23](value);
    	}

    	let fileviewer_props = {};

    	if (/*images*/ ctx[2] !== void 0) {
    		fileviewer_props.images = /*images*/ ctx[2];
    	}

    	if (/*loading*/ ctx[3] !== void 0) {
    		fileviewer_props.loading = /*loading*/ ctx[3];
    	}

    	fileviewer = new Fileviewer({ props: fileviewer_props, $$inline: true });
    	binding_callbacks.push(() => bind(fileviewer, 'images', fileviewer_images_binding));
    	binding_callbacks.push(() => bind(fileviewer, 'loading', fileviewer_loading_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			t0 = text("//style=\"transition: opacity ease-in-out   0.25s; hide ? 'opacity: 80%;' : 'opacity: 100%'\"\n  ");
    			div2 = element("div");
    			create_component(header.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			table0 = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			t2 = space();
    			th1 = element("th");
    			th1.textContent = "Varenummer";
    			t4 = space();
    			th2 = element("th");
    			th2.textContent = "Produktnavn";
    			t6 = space();
    			th3 = element("th");
    			th3.textContent = "Pris fra 05.22";
    			t8 = space();
    			th4 = element("th");
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Slet";
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			create_component(table1.$$.fragment);
    			t13 = space();
    			create_component(footer.$$.fragment);
    			t14 = space();
    			dialog = element("dialog");
    			div3 = element("div");
    			create_component(fileviewer.$$.fragment);
    			t15 = space();
    			script0 = element("script");
    			script0.textContent = "const myDialog = document.getElementById(\"billeder\");\n    myDialog.addEventListener(\"click\", () => myDialog.close());\n    const myDiv = document.getElementById(\"clickable-area\");\n    myDiv.addEventListener(\"click\", (event) => event.stopPropagation());";
    			t17 = space();
    			script1 = element("script");
    			set_style(th0, "width", "55px");
    			add_location(th0, file, 122, 5, 3443);
    			set_style(th1, "width", "160px");
    			add_location(th1, file, 123, 14, 3488);
    			add_location(th2, file, 124, 14, 3544);
    			set_style(th3, "width", "160px");
    			add_location(th3, file, 125, 14, 3579);
    			set_style(th4, "width", "160px");
    			add_location(th4, file, 126, 14, 3639);
    			set_style(th5, "width", "35px");
    			add_location(th5, file, 127, 14, 3682);
    			set_style(tr, "position", "sticky");
    			set_style(tr, "top", "0px");
    			set_style(tr, "height", "30px");
    			set_style(tr, "overflow", "hidden");
    			set_style(tr, "background-color", "#2B2F42");
    			set_style(tr, "color", "white");
    			add_location(tr, file, 121, 12, 3326);
    			set_style(thead, "border-radius", "15px");
    			add_location(thead, file, 120, 10, 3278);
    			add_location(tbody, file, 130, 10, 3765);
    			set_style(table0, "width", "100%");
    			set_style(table0, "text-align", "center");
    			set_style(table0, "border-collapse", "separate", 1);
    			set_style(table0, "margin", "0px");
    			attr_dev(table0, "cellspacing", "0");
    			attr_dev(table0, "class", "svelte-1jn24uk");
    			add_location(table0, file, 119, 8, 3156);
    			attr_dev(div0, "class", "wrap svelte-1jn24uk");
    			set_style(div0, "height", "calc(100% - " + (/*favoriteVisible*/ ctx[5] ? "305" : "100") + "px)");
    			add_location(div0, file, 118, 6, 3064);
    			attr_dev(div1, "class", "table svelte-1jn24uk");
    			set_style(div1, "box-sizing", "content-box");
    			add_location(div1, file, 117, 4, 3005);
    			attr_dev(div2, "class", "container svelte-1jn24uk");
    			add_location(div2, file, 115, 2, 2938);
    			attr_dev(div3, "id", "clickable-area");
    			attr_dev(div3, "class", "clickable-area svelte-1jn24uk");
    			add_location(div3, file, 171, 4, 5871);
    			attr_dev(dialog, "class", "billeder svelte-1jn24uk");
    			attr_dev(dialog, "id", "billeder");
    			add_location(dialog, file, 170, 2, 5827);
    			add_location(script0, file, 175, 2, 5991);
    			if (!src_url_equal(script1.src, script1_src_value = "./renderer.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file, 181, 2, 6270);
    			attr_dev(main, "class", "svelte-1jn24uk");
    			add_location(main, file, 114, 0, 2837);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, t0);
    			append_dev(main, div2);
    			mount_component(header, div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, table0);
    			append_dev(table0, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t2);
    			append_dev(tr, th1);
    			append_dev(tr, t4);
    			append_dev(tr, th2);
    			append_dev(tr, t6);
    			append_dev(tr, th3);
    			append_dev(tr, t8);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(table0, t11);
    			append_dev(table0, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tbody, null);
    				}
    			}

    			append_dev(div0, t12);
    			mount_component(table1, div0, null);
    			append_dev(div2, t13);
    			mount_component(footer, div2, null);
    			append_dev(main, t14);
    			append_dev(main, dialog);
    			append_dev(dialog, div3);
    			mount_component(fileviewer, div3, null);
    			append_dev(main, t15);
    			append_dev(main, script0);
    			append_dev(main, t17);
    			append_dev(main, script1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (!updating_søgning && dirty[0] & /*søgning*/ 2) {
    				updating_søgning = true;
    				header_changes.søgning = /*søgning*/ ctx[1];
    				add_flush_callback(() => updating_søgning = false);
    			}

    			if (!updating_varer && dirty[0] & /*varer*/ 1) {
    				updating_varer = true;
    				header_changes.varer = /*varer*/ ctx[0];
    				add_flush_callback(() => updating_varer = false);
    			}

    			header.$set(header_changes);

    			if (dirty[0] & /*varer, imagegallery, visibleVarer*/ 81) {
    				each_value = /*visibleVarer*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const table1_changes = {};

    			if (!updating_favoriteVisible && dirty[0] & /*favoriteVisible*/ 32) {
    				updating_favoriteVisible = true;
    				table1_changes.favoriteVisible = /*favoriteVisible*/ ctx[5];
    				add_flush_callback(() => updating_favoriteVisible = false);
    			}

    			if (!updating_loading && dirty[0] & /*loading*/ 8) {
    				updating_loading = true;
    				table1_changes.loading = /*loading*/ ctx[3];
    				add_flush_callback(() => updating_loading = false);
    			}

    			if (!updating_images && dirty[0] & /*images*/ 4) {
    				updating_images = true;
    				table1_changes.images = /*images*/ ctx[2];
    				add_flush_callback(() => updating_images = false);
    			}

    			if (!updating_varer_1 && dirty[0] & /*varer*/ 1) {
    				updating_varer_1 = true;
    				table1_changes.varer = /*varer*/ ctx[0];
    				add_flush_callback(() => updating_varer_1 = false);
    			}

    			table1.$set(table1_changes);

    			if (!current || dirty[0] & /*favoriteVisible*/ 32) {
    				set_style(div0, "height", "calc(100% - " + (/*favoriteVisible*/ ctx[5] ? "305" : "100") + "px)");
    			}

    			const footer_changes = {};

    			if (!updating_varer_2 && dirty[0] & /*varer*/ 1) {
    				updating_varer_2 = true;
    				footer_changes.varer = /*varer*/ ctx[0];
    				add_flush_callback(() => updating_varer_2 = false);
    			}

    			if (!updating_favoriteVisible_1 && dirty[0] & /*favoriteVisible*/ 32) {
    				updating_favoriteVisible_1 = true;
    				footer_changes.favoriteVisible = /*favoriteVisible*/ ctx[5];
    				add_flush_callback(() => updating_favoriteVisible_1 = false);
    			}

    			footer.$set(footer_changes);
    			const fileviewer_changes = {};

    			if (!updating_images_1 && dirty[0] & /*images*/ 4) {
    				updating_images_1 = true;
    				fileviewer_changes.images = /*images*/ ctx[2];
    				add_flush_callback(() => updating_images_1 = false);
    			}

    			if (!updating_loading_1 && dirty[0] & /*loading*/ 8) {
    				updating_loading_1 = true;
    				fileviewer_changes.loading = /*loading*/ ctx[3];
    				add_flush_callback(() => updating_loading_1 = false);
    			}

    			fileviewer.$set(fileviewer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(table1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			transition_in(fileviewer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(table1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			transition_out(fileviewer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_each(each_blocks, detaching);
    			destroy_component(table1);
    			destroy_component(footer);
    			destroy_component(fileviewer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let favoriteVisible;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let loading = false;
    	let changed = false;
    	let vare = { Varenummer: 0, Produktnavn: "", Pris: 0 };
    	let varer = ["DoNotSave"];
    	let data = window.electronApi.loadJSON();

    	//IT PREVENTS SAVING BEFORE THE DATA HAS BEEN LOADED
    	let done = false; // DO NOT CHANGE THIS

    	//DON'T YOU DARE
    	if (data instanceof Error) {
    		console.log(data);
    	} else {
    		data.then(response => {
    			$$invalidate(0, varer = response);
    			$$invalidate(0, varer);
    			done = true;
    		});
    	}

    	let visibleVarer = [];
    	let søgning = "";
    	let p = "";
    	let images = [];
    	window.productName = "";

    	function dataChanged(v) {
    		if (v) changed = true;
    	}

    	function addImage(image) {
    		images.push(image);
    		$$invalidate(2, images);
    	}

    	window.addImage = addImage;

    	async function imagegallery(vn) {
    		console.log(vn);
    		const dialogElement = document.getElementById("billeder");
    		window.productName = vn.toString();
    		dialogElement.showModal();

    		try {
    			$$invalidate(3, loading = true);

    			if (productName === "") {
    				productName = " ";
    			}

    			const imageNames = await window.electronApi.getProductImages(productName);
    			$$invalidate(3, loading = false);

    			if (imageNames && imageNames.length > 0) {
    				console.log(imageNames);
    				$$invalidate(2, images = imageNames.map(imageName => ({ name: imageName, src: imageName })));
    			} else {
    				console.warn("No images found for the specified product.");
    				$$invalidate(2, images = []);
    				$$invalidate(3, loading = false);
    			}
    		} catch(error) {
    			console.error("Error loading images:", error);
    			$$invalidate(3, loading = false);
    		}
    	}

    	setInterval(
    		() => {
    			if (done && !(varer[0] === "DoNotSave") && changed) {
    				//checks if api promise is fulfilled and data is recieved. and then checks that "varer" doesn't still have its default value, preventing overwriting the save on a slow load.
    				window.electronApi.SaveToJSON(JSON.stringify(varer));

    				changed = false;
    			}
    		},
    		10000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function header_søgning_binding(value) {
    		søgning = value;
    		$$invalidate(1, søgning);
    	}

    	function header_varer_binding(value) {
    		varer = value;
    		$$invalidate(0, varer);
    	}

    	function input0_change_handler(each_value, i) {
    		each_value[i].checked = this.checked;
    		(($$invalidate(4, visibleVarer), $$invalidate(1, søgning)), $$invalidate(0, varer));
    	}

    	function input1_input_handler(each_value, i) {
    		each_value[i].Varenummer = this.value;
    		(($$invalidate(4, visibleVarer), $$invalidate(1, søgning)), $$invalidate(0, varer));
    	}

    	function input2_input_handler(each_value, i) {
    		each_value[i].Produktnavn = this.value;
    		(($$invalidate(4, visibleVarer), $$invalidate(1, søgning)), $$invalidate(0, varer));
    	}

    	function input3_input_handler(each_value, i) {
    		each_value[i].Pris = this.value;
    		(($$invalidate(4, visibleVarer), $$invalidate(1, søgning)), $$invalidate(0, varer));
    	}

    	const click_handler = vare => {
    		imagegallery(vare.Varenummer);
    	};

    	const click_handler_1 = i => {
    		varer.splice(i, 1);
    		$$invalidate(0, varer);
    	};

    	function table1_favoriteVisible_binding(value) {
    		favoriteVisible = value;
    		$$invalidate(5, favoriteVisible);
    	}

    	function table1_loading_binding(value) {
    		loading = value;
    		$$invalidate(3, loading);
    	}

    	function table1_images_binding(value) {
    		images = value;
    		$$invalidate(2, images);
    	}

    	function table1_varer_binding(value) {
    		varer = value;
    		$$invalidate(0, varer);
    	}

    	function footer_varer_binding(value) {
    		varer = value;
    		$$invalidate(0, varer);
    	}

    	function footer_favoriteVisible_binding(value) {
    		favoriteVisible = value;
    		$$invalidate(5, favoriteVisible);
    	}

    	function fileviewer_images_binding(value) {
    		images = value;
    		$$invalidate(2, images);
    	}

    	function fileviewer_loading_binding(value) {
    		loading = value;
    		$$invalidate(3, loading);
    	}

    	$$self.$capture_state = () => ({
    		fade,
    		Header,
    		Footer,
    		Fileviewer,
    		Table,
    		loading,
    		changed,
    		vare,
    		varer,
    		data,
    		done,
    		visibleVarer,
    		søgning,
    		p,
    		images,
    		dataChanged,
    		addImage,
    		imagegallery,
    		favoriteVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ('loading' in $$props) $$invalidate(3, loading = $$props.loading);
    		if ('changed' in $$props) changed = $$props.changed;
    		if ('vare' in $$props) $$invalidate(7, vare = $$props.vare);
    		if ('varer' in $$props) $$invalidate(0, varer = $$props.varer);
    		if ('data' in $$props) data = $$props.data;
    		if ('done' in $$props) done = $$props.done;
    		if ('visibleVarer' in $$props) $$invalidate(4, visibleVarer = $$props.visibleVarer);
    		if ('søgning' in $$props) $$invalidate(1, søgning = $$props.søgning);
    		if ('p' in $$props) p = $$props.p;
    		if ('images' in $$props) $$invalidate(2, images = $$props.images);
    		if ('favoriteVisible' in $$props) $$invalidate(5, favoriteVisible = $$props.favoriteVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*varer*/ 1) {
    			$$invalidate(0, varer);
    		}

    		if ($$self.$$.dirty[0] & /*søgning, varer*/ 3) {
    			$$invalidate(4, visibleVarer = søgning
    			? varer.filter(vare => (vare.Varenummer + "").startsWith(søgning))
    			: varer);
    		}

    		if ($$self.$$.dirty[0] & /*images*/ 4) {
    			$$invalidate(2, images);
    		}

    		if ($$self.$$.dirty[0] & /*varer*/ 1) {
    			{
    				dataChanged(varer);
    			}
    		}
    	};

    	$$invalidate(5, favoriteVisible = false);

    	return [
    		varer,
    		søgning,
    		images,
    		loading,
    		visibleVarer,
    		favoriteVisible,
    		imagegallery,
    		vare,
    		header_søgning_binding,
    		header_varer_binding,
    		input0_change_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		click_handler,
    		click_handler_1,
    		table1_favoriteVisible_binding,
    		table1_loading_binding,
    		table1_images_binding,
    		table1_varer_binding,
    		footer_varer_binding,
    		footer_favoriteVisible_binding,
    		fileviewer_images_binding,
    		fileviewer_loading_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
