const fs = require('fs');
const path = 'temp_seed.txt';

try {
    let content = fs.readFileSync(path, 'utf8');

    const oldText = `### War and Resurrection: Batyrs of WWII

Kazakhstan sent 1.2 million soldiers to fight Hitler; half never returned. Their heroism forged new national legends amid repression.

| Hero | Key Deed | Legacy |
| --- | --- | --- |
| **Bauyrzhan Momyshuly** | Led Panfilov’s Guards; guerrilla tactics now studied at **West Point**. | Memoirs became national manuals on strategy and courage. |
| **Aliya Moldagulova** | Sniper with 91 confirmed kills; died storming a German position at 18. | Asteroid **3122 Aliya** bears her name. |`;

    const newText = `### WWII and Industrialization

Despite the tragedy of the famine, Kazakhstan became the industrial backbone of the Soviet Union during WWII. Bullets cast in Kazakh lead fired at the front, and the steppe became a forge for victory.

**The Cost of Transformation**

The Soviet era brought rapid modernization, but at a staggering human cost.

*   **Tragedy (Famine & Repression):** The forced collectivization (Asharshylyk) and political purges destroyed the traditional nomadic economy and claimed nearly half the population.
*   **Modernization (Education & Science):** In parallel, the region saw the construction of schools, universities, and massive industrial infrastructure, transforming a nomadic society into an industrial one.
*   **Global Impact:** From the **Baikonur Cosmodrome**, humanity took its first steps into space, launching Yuri Gagarin in 1961.

**Heroes of the Front**

Kazakhstan sent 1.2 million soldiers to fight Hitler; half never returned.

| Hero | Key Deed | Legacy |
| --- | --- | --- |
| **Bauyrzhan Momyshuly** | Led Panfilov’s Guards; guerrilla tactics now studied at **West Point**. | Memoirs became national manuals on strategy and courage. |
| **Aliya Moldagulova** | Sniper with 91 confirmed kills; died storming a German position at 18. | Asteroid **3122 Aliya** bears her name. |`;

    // Normalize line endings and spaces for robust matching
    // Note: The file content has "1.2 million" (narrow no-break space potentially) or just normal space.
    // The view_file output showed "1.2 million" with a special char maybe?
    // Let's try to match a substring or be more flexible.

    // I will replace the specific block.
    // If exact match fails, I'll try to find the header and replace until the next section.

    if (content.includes(oldText)) {
        content = content.replace(oldText, newText);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Successfully replaced content (exact match).");
    } else {
        console.log("Exact match failed. Trying flexible replacement.");
        // Construct a regex to match the section
        // Matches from "### War and Resurrection" to the end of the table
        const regex = /### War and Resurrection: Batyrs of WWII[\s\S]*?bears her name\. \|/;

        if (regex.test(content)) {
            content = content.replace(regex, newText);
            fs.writeFileSync(path, content, 'utf8');
            console.log("Successfully replaced content (regex match).");
        } else {
            console.log("Could not find text to replace.");
            // Debug: print the section from file
            const idx = content.indexOf("War and Resurrection");
            if (idx !== -1) {
                console.log("Found header at index " + idx);
                console.log("Snippet: " + content.substring(idx, idx + 200));
            }
        }
    }

} catch (err) {
    console.error("Error:", err);
}
