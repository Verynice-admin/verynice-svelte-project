import asyncio
from playwright.async_api import async_playwright

async def get_computed_styles(page, selector, props):
    return await page.evaluate(f'''
        const el = document.querySelector('{selector}');
        if (!el) return null;
        const style = window.getComputedStyle(el);
        const result = {{}};
        {props}.forEach(prop => result[prop] = style.getPropertyValue(prop));
        return result;
    ''')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(**p.devices['iPhone 12 Pro'])
        page = await context.new_page()

        props = ['font-size', 'font-weight', 'font-family', 'color', 'background', 'background-color', 'border', 'border-radius', 'box-shadow', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'width', 'max-width', 'min-height', 'height', 'display', 'align-items', 'align-self', 'justify-content', 'gap', 'transform', 'transition', 'text-transform', 'letter-spacing', 'line-height']

        # Destinations
        await page.goto('http://localhost:5174/destinations')
        await page.wait_for_load_state('networkidle')

        dest_read_more = await get_computed_styles(page, '.read-more', props)
        dest_card_image_wrapper = await get_computed_styles(page, '.card-image-wrapper', ['width', 'height', 'aspect-ratio', 'overflow', 'border-radius', 'background-color'])
        dest_card_image = await get_computed_styles(page, '.card-image', ['position', 'inset', 'width', 'height', 'background-size', 'background-position'])
        dest_attractions_item_content = await get_computed_styles(page, '.attractions-item-content', ['padding', 'gap', 'display', 'flex-direction', 'align-items', 'background'])
        dest_item_title = await get_computed_styles(page, '.item-title', ['font-size', 'font-weight', 'color', 'text-align', 'line-height', 'margin', '-webkit-line-clamp'])
        dest_item_description = await get_computed_styles(page, '.item-description', ['font-size', 'color', 'text-align', 'line-height', '-webkit-line-clamp', 'display', 'margin'])
        dest_attractions_item_card = await get_computed_styles(page, '.attractions-item-card', ['width', 'max-width', 'background', 'border-radius', 'overflow', 'padding', 'display', 'flex-direction', 'aspect-ratio'])

        # Tips
        await page.goto('http://localhost:5174/tips')
        await page.wait_for_load_state('networkidle')

        tips_read_more = await get_computed_styles(page, '.read-more', props)
        tips_card_image_wrapper = await get_computed_styles(page, '.card-image-wrapper', ['width', 'height', 'aspect-ratio', 'overflow', 'border-radius', 'background-color'])
        tips_card_image = await get_computed_styles(page, '.card-image', ['position', 'inset', 'width', 'height', 'background-size', 'background-position'])
        tips_attractions_item_content = await get_computed_styles(page, '.attractions-item-content', ['padding', 'gap', 'display', 'flex-direction', 'align-items', 'background'])
        tips_item_title = await get_computed_styles(page, '.item-title', ['font-size', 'font-weight', 'color', 'text-align', 'line-height', 'margin', '-webkit-line-clamp'])
        tips_item_description = await get_computed_styles(page, '.item-description', ['font-size', 'color', 'text-align', 'line-height', '-webkit-line-clamp', 'display', 'margin'])
        tips_attractions_item_card = await get_computed_styles(page, '.attractions-item-card', ['width', 'max-width', 'background', 'border-radius', 'overflow', 'padding', 'display', 'flex-direction', 'aspect-ratio'])

        await browser.close()

        # Print comparison table
        print("PHASE 1 — FULL COMPUTED STYLE AUDIT")
        print()
        print("Element: .read-more")
        print("Property | Destinations | Tips")
        print("---------|-------------|-----")
        for prop in props:
            dest_val = dest_read_more.get(prop, 'null') if dest_read_more else 'null'
            tips_val = tips_read_more.get(prop, 'null') if tips_read_more else 'null'
            flag = "DIFFER" if dest_val != tips_val else ""
            print(f"{prop} | {dest_val} | {tips_val} {flag}")

        # Similarly for other elements
        elements = [
            ('.card-image-wrapper', ['width', 'height', 'aspect-ratio', 'overflow', 'border-radius', 'background-color'], dest_card_image_wrapper, tips_card_image_wrapper),
            ('.card-image', ['position', 'inset', 'width', 'height', 'background-size', 'background-position'], dest_card_image, tips_card_image),
            ('.attractions-item-content', ['padding', 'gap', 'display', 'flex-direction', 'align-items', 'background'], dest_attractions_item_content, tips_attractions_item_content),
            ('.item-title', ['font-size', 'font-weight', 'color', 'text-align', 'line-height', 'margin', '-webkit-line-clamp'], dest_item_title, tips_item_title),
            ('.item-description', ['font-size', 'color', 'text-align', 'line-height', '-webkit-line-clamp', 'display', 'margin'], dest_item_description, tips_item_description),
            ('.attractions-item-card', ['width', 'max-width', 'background', 'border-radius', 'overflow', 'padding', 'display', 'flex-direction', 'aspect-ratio'], dest_attractions_item_card, tips_attractions_item_card),
        ]

        for selector, props_list, dest_styles, tips_styles in elements:
            print()
            print(f"Element: {selector}")
            print("Property | Destinations | Tips")
            print("---------|-------------|-----")
            for prop in props_list:
                dest_val = dest_styles.get(prop, 'null') if dest_styles else 'null'
                tips_val = tips_styles.get(prop, 'null') if tips_styles else 'null'
                flag = "DIFFER" if dest_val != tips_val else ""
                print(f"{prop} | {dest_val} | {tips_val} {flag}")

asyncio.run(main())