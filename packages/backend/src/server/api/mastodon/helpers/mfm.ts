import { IMentionedRemoteUsers } from "@/models/entities/note.js";
import { JSDOM } from "jsdom";
import config from "@/config/index.js";
import { intersperse } from "@/prelude/array.js";
import mfm from "mfm-js";

export class MfmHelpers {
    public static toHtml(
        nodes: mfm.MfmNode[] | null,
        mentionedRemoteUsers: IMentionedRemoteUsers = [],
        objectHost: string | null,
        inline: boolean = false
    ) {
        if (nodes == null) {
            return null;
        }

        const { window } = new JSDOM("");

        const doc = window.document;

        function appendChildren(children: mfm.MfmNode[], targetElement: any): void {
            if (children) {
                for (const child of children.map((x) => (handlers as any)[x.type](x)))
                    targetElement.appendChild(child);
            }
        }

        const handlers: {
            [K in mfm.MfmNode["type"]]: (node: mfm.NodeType<K>) => any;
        } = {
            bold(node) {
                const el = doc.createElement("span");
                el.textContent = '**';
                appendChildren(node.children, el);
                el.textContent += '**';
                return el;
            },

            small(node) {
                const el = doc.createElement("small");
                appendChildren(node.children, el);
                return el;
            },

            strike(node) {
                const el = doc.createElement("span");
                el.textContent = '~~';
                appendChildren(node.children, el);
                el.textContent += '~~';
                return el;
            },

            italic(node) {
                const el = doc.createElement("span");
                el.textContent = '*';
                appendChildren(node.children, el);
                el.textContent += '*';
                return el;
            },

            fn(node) {
                const el = doc.createElement("span");
                el.textContent = '*';
                appendChildren(node.children, el);
                el.textContent += '*';
                return el;
            },

            blockCode(node) {
                const pre = doc.createElement("pre");
                const inner = doc.createElement("code");

                const nodes = node.props.code
                    .split(/\r\n|\r|\n/)
                    .map((x) => doc.createTextNode(x));

                for (const x of intersperse<FIXME | "br">("br", nodes)) {
                    inner.appendChild(x === "br" ? doc.createElement("br") : x);
                }

                pre.appendChild(inner);
                return pre;
            },

            center(node) {
                const el = doc.createElement("div");
                appendChildren(node.children, el);
                return el;
            },

            emojiCode(node) {
                return doc.createTextNode(`\u200B:${node.props.name}:\u200B`);
            },

            unicodeEmoji(node) {
                return doc.createTextNode(node.props.emoji);
            },

            hashtag(node) {
                const a = doc.createElement("a");
                a.href = `${config.url}/tags/${node.props.hashtag}`;
                a.textContent = `#${node.props.hashtag}`;
                a.setAttribute("rel", "tag");
                return a;
            },

            inlineCode(node) {
                const el = doc.createElement("code");
                el.textContent = node.props.code;
                return el;
            },

            mathInline(node) {
                const el = doc.createElement("code");
                el.textContent = node.props.formula;
                return el;
            },

            mathBlock(node) {
                const el = doc.createElement("code");
                el.textContent = node.props.formula;
                return el;
            },

            link(node) {
                const a = doc.createElement("a");
                a.setAttribute("rel", "nofollow noopener noreferrer");
                a.setAttribute("target", "_blank");
                a.href = node.props.url;
                appendChildren(node.children, a);
                return a;
            },

            mention(node) {
                const el = doc.createElement("span");
                el.setAttribute("class", "h-card");
                el.setAttribute("translate", "no");
                const a = doc.createElement("a");
                const { username, host} = node.props;
                const remoteUserInfo = mentionedRemoteUsers.find(
                    (remoteUser) =>
                        remoteUser.username === username && remoteUser.host === host,
                );
                const localpart = `@${username}`;
                const isLocal = host === config.domain || (host == null && objectHost == null);
                const acct = isLocal ? localpart: node.props.acct;
                a.href = remoteUserInfo
                    ? remoteUserInfo.url
                        ? remoteUserInfo.url
                        : remoteUserInfo.uri
                    : isLocal
                        ? `${config.url}/${acct}`
                        : host == null
                            ? `https://${objectHost}/${localpart}`
                            : `https://${host}/${localpart}`;
                a.className = "u-url mention";
                const span = doc.createElement("span");
                span.textContent = username;
                a.textContent = '@';
                a.appendChild(span);
                el.appendChild(a);
                return el;
            },

            quote(node) {
                const el = doc.createElement("blockquote");
                appendChildren(node.children, el);
                return el;
            },

            text(node) {
                const el = doc.createElement("span");
                const nodes = node.props.text
                    .split(/\r\n|\r|\n/)
                    .map((x) => doc.createTextNode(x));

                for (const x of intersperse<FIXME | "br">("br", nodes)) {
                    el.appendChild(x === "br" ? doc.createElement("br") : x);
                }

                return el;
            },

            url(node) {
                const a = doc.createElement("a");
                a.setAttribute("rel", "nofollow noopener noreferrer");
                a.setAttribute("target", "_blank");
                a.href = node.props.url;
                a.textContent = node.props.url.replace(/^https?:\/\//, '');
                return a;
            },

            search(node) {
                const a = doc.createElement("a");
                a.href = `${config.searchEngine}${node.props.query}`;
                a.textContent = node.props.content;
                return a;
            },

            plain(node) {
                const el = doc.createElement("span");
                appendChildren(node.children, el);
                return el;
            },
        };

        appendChildren(nodes, doc.body);

        return inline ? doc.body.innerHTML : `<p>${doc.body.innerHTML}</p>`;
    }
}
