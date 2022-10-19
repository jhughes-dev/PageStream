
// Some script setup issues won't let this export into Nuxt/Vue components
interface PageFlowOptions {
    aspect?: string;
    height?: string;
    margin?: string;
};

/*
* @param: node - The Input Node should be the
*   containing element all subsequent pages
*   will be inserted as siblings of this node
*/
const usePageFlow = () => ((source: HTMLElement, dest: HTMLElement, {aspect, height, margin}: PageFlowOptions) => {

    const blankPage = dest.cloneNode(true) as HTMLElement;

    const children: HTMLElement[] = [];
    for (let k = 0; k < source.children.length; ++k) {
        const node = source.children.item(k).cloneNode(true) as HTMLElement;
        node.classList.remove('invisible');
        children.push(node)
    }
    source.innerHTML = "";
    //(source.parentNode as HTMLElement).removeChild(source);
    // Create a node that is fixed in width, and let each element fill the size.
    blankPage.style.padding = margin;
    blankPage.style.aspectRatio = aspect;
    blankPage.style.height = height;
    blankPage.style.maxHeight = height;
    blankPage.style.minHeight = height;
    blankPage.innerHTML = "";
    //blankPage.classList.add('invisible')
    // const [w, h] = aspect.split('/').map(n => Number(n));
    const {innerHeight, innerWidth, rowHeight} = getDimensions(blankPage);

    console.log({innerHeight, innerWidth, rowHeight})
    document.body.insertBefore(blankPage, null);

    const container = dest.parentElement;
    let numPages = 1;
    dest.id = `page-flow-${numPages}`;
    let remaining = innerHeight;
    for (let i = 0; i < children.length; ++i) {
        let node = children[i];

        blankPage.insertBefore(node, null);
        if (node.offsetHeight < remaining) {
            blankPage.removeChild(node);
            dest.insertBefore(node, null);
            remaining -= node.offsetHeight;
            continue;
        }

        if (remaining > rowHeight) {
            // Need to split the node by text if possible.
            const child = node.firstChild

            const relativeHeight = remaining / node.offsetHeight

            blankPage.removeChild(node);

            // This needs more work, but basically this is
            // trying to split a paragraph across divs
            if (child.nodeType === Node.TEXT_NODE) {
                const content = child.textContent;
                const idx = Math.floor(content.length * relativeHeight);
                const lastSpace = content.lastIndexOf(" ", idx);

                node.innerText = content.substring(0, lastSpace);
                dest.insertBefore(node, null);
                if (node.offsetHeight > remaining) {
                    //split more.
                    console.log("Overflow")
                    node.style.backgroundColor = 'rgba(255,0,0,0.5)'
                }
                // or add more if there's more words to be added.

                // want to check for orphans, i.e. numLines === 1
                node = node.cloneNode() as HTMLElement;
                node.innerText = content.substring(lastSpace+1);
                node.style.backgroundColor = null
            }
        }
        let newPage = blankPage.cloneNode() as HTMLDivElement;
        numPages++;
        newPage.id = `page-flow-${numPages}`;
        container.insertBefore(newPage, null);
        dest = newPage;
        dest.insertBefore(node, null);
        remaining = innerHeight - node.offsetHeight;

    }

    document.body.removeChild(blankPage);
    //dest.parentNode.insertBefore(node,null);
})

export default usePageFlow;

function getDimensions(blankPage: HTMLElement): {innerHeight: number, innerWidth: number, rowHeight: number} {
    let fauxPage = blankPage.cloneNode() as HTMLDivElement;
    fauxPage.id = "faux-page";
    fauxPage.style.position = "absolute";
    fauxPage.style.display = "flex";
    const expander = document.createElement('div');
    expander.style.height = "100%";
    expander.style.width = "100%";
    fauxPage.insertBefore(expander, null);
    document.body.insertBefore(fauxPage, null);

    const innerHeight = expander.offsetHeight;
    const innerWidth = expander.offsetWidth;

    const text = document.createElement('p');
    text.innerText = "A";
    expander.insertBefore(text, null);

    const rowHeight = text.offsetHeight;
    document.body.removeChild(fauxPage);

    return {innerHeight, innerWidth, rowHeight};
}
