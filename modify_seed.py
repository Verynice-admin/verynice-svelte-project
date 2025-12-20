import os

path = 'temp_seed.txt'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_text = """### War and Resurrection: Batyrs of WWII

Kazakhstan sent 1.2 million soldiers to fight Hitler; half never returned. Their heroism forged new national legends amid repression.

| Hero | Key Deed | Legacy |
| --- | --- | --- |
| **Bauyrzhan Momyshuly** | Led Panfilov’s Guards; guerrilla tactics now studied at **West Point**. | Memoirs became national manuals on strategy and courage. |
| **Aliya Moldagulova** | Sniper with 91 confirmed kills; died storming a German position at 18. | Asteroid **3122 Aliya** bears her name. |"""

new_text = """### WWII and Industrialization

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
| **Aliya Moldagulova** | Sniper with 91 confirmed kills; died storming a German position at 18. | Asteroid **3122 Aliya** bears her name. |"""

# Normalize line endings just in case
content = content.replace('\r\n', '\n')
old_text = old_text.replace('\r\n', '\n')
new_text = new_text.replace('\r\n', '\n')

if old_text in content:
    new_content = content.replace(old_text, new_text)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced content.")
else:
    print("Could not find old text.")
    # Find where "War and Resurrection" is
    idx = content.find("War and Resurrection")
    if idx != -1:
        print(f"Found 'War and Resurrection' at index {idx}")
        print("Surrounding text:")
        print(content[idx:idx+200])
    else:
        print("Could not find 'War and Resurrection' at all.")
