import { toggleDisabledSidebarItem } from "./disableSidebarItem";

describe("toggleDisabledSidebarItem", () => {
    beforeEach(() => {
        // Clear DOM before each test
        document.body.innerHTML = "";
    });

    it("should add disabled classes when isDisabled is true", () => {
        const sidebarItemId = "test-item";
        
        // Create elements with the expected aria-labelledby attributes
        const accentElement = document.createElement("div");
        accentElement.setAttribute("aria-labelledby", `body_${sidebarItemId}`);
        document.body.appendChild(accentElement);

        const bodyElement = document.createElement("div");
        bodyElement.setAttribute("aria-labelledby", `bodyTwo_${sidebarItemId}`);
        document.body.appendChild(bodyElement);

        const textElement = document.createElement("div");
        textElement.setAttribute("aria-labelledby", `text_${sidebarItemId}`);
        document.body.appendChild(textElement);

        toggleDisabledSidebarItem(sidebarItemId, true);

        expect(accentElement.classList.contains("stencil_accent-disabled")).toBe(true);
        expect(bodyElement.classList.contains("stencil_body-disabled")).toBe(true);
        expect(textElement.classList.contains("stencil_text-disabled")).toBe(true);
    });

    it("should remove disabled classes when isDisabled is false", () => {
        const sidebarItemId = "test-item";
        
        const accentElement = document.createElement("div");
        accentElement.setAttribute("aria-labelledby", `body_${sidebarItemId}`);
        accentElement.classList.add("stencil_accent-disabled");
        document.body.appendChild(accentElement);

        const bodyElement = document.createElement("div");
        bodyElement.setAttribute("aria-labelledby", `bodyTwo_${sidebarItemId}`);
        bodyElement.classList.add("stencil_body-disabled");
        document.body.appendChild(bodyElement);

        const textElement = document.createElement("div");
        textElement.setAttribute("aria-labelledby", `text_${sidebarItemId}`);
        textElement.classList.add("stencil_text-disabled");
        document.body.appendChild(textElement);

        toggleDisabledSidebarItem(sidebarItemId, false);

        expect(accentElement.classList.contains("stencil_accent-disabled")).toBe(false);
        expect(bodyElement.classList.contains("stencil_body-disabled")).toBe(false);
        expect(textElement.classList.contains("stencil_text-disabled")).toBe(false);
    });

    it("should handle missing elements gracefully", () => {
        const sidebarItemId = "non-existent-item";

        // Should not throw
        expect(() => {
            toggleDisabledSidebarItem(sidebarItemId, true);
        }).not.toThrow();
    });

    it("should handle undefined isDisabled parameter", () => {
        const sidebarItemId = "test-item";
        
        const accentElement = document.createElement("div");
        accentElement.setAttribute("aria-labelledby", `body_${sidebarItemId}`);
        document.body.appendChild(accentElement);

        // When isDisabled is undefined, classList.toggle will toggle the class
        // (add if not present, remove if present)
        // Since the class is not present initially, it will be added
        toggleDisabledSidebarItem(sidebarItemId, undefined);

        expect(accentElement.classList.contains("stencil_accent-disabled")).toBe(true);
    });

    it("should work with multiple sidebar items", () => {
        const item1Id = "item-1";
        const item2Id = "item-2";
        
        const item1Element = document.createElement("div");
        item1Element.setAttribute("aria-labelledby", `body_${item1Id}`);
        document.body.appendChild(item1Element);

        const item2Element = document.createElement("div");
        item2Element.setAttribute("aria-labelledby", `body_${item2Id}`);
        document.body.appendChild(item2Element);

        toggleDisabledSidebarItem(item1Id, true);
        toggleDisabledSidebarItem(item2Id, false);

        expect(item1Element.classList.contains("stencil_accent-disabled")).toBe(true);
        expect(item2Element.classList.contains("stencil_accent-disabled")).toBe(false);
    });
});
