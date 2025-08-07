<!-- src/lib/components/ui-elements/SocialShare.svelte (FINAL, WITH ALL ICONS) -->

<script>
    export let title = 'Share with friends!';

    // These will be populated on the client-side to ensure they are correct
    let shareUrl = '';
    let shareText = '';

    import { onMount } from 'svelte';
    onMount(() => {
        shareUrl = encodeURIComponent(window.location.href);
        shareText = encodeURIComponent(document.title);
    });
</script>

<div class="share-block">
    <h4>{title}</h4>
    <div class="social-share-icons">
        <!-- Facebook -->
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
            <span class="icon-social icon-social-facebook"></span>
        </a>
        <!-- Twitter (X) -->
        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
            <span class="icon-social icon-social-twitter"></span>
        </a>
        <!-- WhatsApp -->
        <a href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
            <span class="icon-social icon-social-whatsapp"></span>
        </a>
        <!-- Telegram -->
        <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram">
            <span class="icon-social icon-social-telegram"></span>
        </a>
        <!-- Pinterest -->
        <a href={`https://pinterest.com/pin/create/button/?url=${shareUrl}&media=&description=${shareText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest">
            <span class="icon-social icon-social-pinterest"></span>
        </a>
        <!-- Email -->
        <a href={`mailto:?subject=${shareText}&body=Check%20out%20this%20link:%20${shareUrl}`} aria-label="Share via Email">
            <span class="icon-social icon-social-email"></span>
        </a>
    </div>
</div>

<style>
    .share-block {
        text-align: left;
    }
    
    h4 {
        font-size: 0.9em;
        font-family: var(--vnk-font-primary);
        color: var(--vnk-text-secondary-color);
        margin-bottom: var(--vnk-spacing-sm);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
    }

    .social-share-icons {
        display: flex;
        align-items: center;
        flex-wrap: wrap; /* Allow icons to wrap on small screens */
        gap: var(--vnk-spacing-md);
    }

    .social-share-icons a {
        display: inline-flex;
        transition: transform 0.2s ease;
    }

    .social-share-icons a:hover {
        transform: scale(1.15);
        text-decoration: none;
    }

    .icon-social {
        display: block;
        width: 28px;
        height: 28px;
        background-color: var(--vnk-text-secondary-color);
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        -webkit-mask-size: contain;
        mask-size: contain;
        transition: background-color 0.3s ease;
    }

    .social-share-icons a:hover .icon-social {
        background-color: var(--vnk-text-accent-color);
    }
    
    /* --- THE FIX: Embedded SVG Icons --- */
    .icon-social-facebook {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z'/%3E%3C/svg%3E");
    }
    .icon-social-twitter {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.214 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.79-32.161 39.308-52.628 54.253z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.214 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.79-32.161 39.308-52.628 54.253z'/%3E%3C/svg%3E");
    }
    .icon-social-whatsapp {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='black' d='M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.2-26.7l-7-4.1-72.5 19 19.3-71.1-4.5-7.4C53.5 340.4 43.1 306.3 43.1 270.4c0-99.4 80.7-180.1 180.1-180.1 49.1 0 95.2 19.2 127.3 51.4 32.1 32.1 49.7 75.3 49.7 122.5 0 99.4-80.7 180.1-180.1 180.1zM223.9 111c-5.4 0-10.8 1.5-15.3 4.5-4.5 3-9.5 7.9-15.8 15.8-6.3 7.9-13.5 17.6-15.8 20.3-2.3 2.7-4.8 5.4-6.3 8.1-1.5 2.7-2.9 5.8-2.9 8.1s-.4 5.8 2.3 10.8c2.7 5.1 11.8 22.5 25.3 36 13.5 13.5 29.6 24.9 36 29.6 6.3 4.8 10.8 5.4 13.5 5.4 2.7 0 5.8-.4 8.1-2.9 2.3-2.5 5.1-5.1 8.1-6.3 3-1.3 7.9-2.7 15.8-6.3s13.5-9.5 15.8-15.8c2.3-6.3 4.5-13.5 4.5-15.8s-1.5-10.8-4.5-15.3c-3-4.5-17.6-22-22-26.7-4.5-4.8-10.8-7.5-15.3-7.5z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='black' d='M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.2-26.7l-7-4.1-72.5 19 19.3-71.1-4.5-7.4C53.5 340.4 43.1 306.3 43.1 270.4c0-99.4 80.7-180.1 180.1-180.1 49.1 0 95.2 19.2 127.3 51.4 32.1 32.1 49.7 75.3 49.7 122.5 0 99.4-80.7 180.1-180.1 180.1zM223.9 111c-5.4 0-10.8 1.5-15.3 4.5-4.5 3-9.5 7.9-15.8 15.8-6.3 7.9-13.5 17.6-15.8 20.3-2.3 2.7-4.8 5.4-6.3 8.1-1.5 2.7-2.9 5.8-2.9 8.1s-.4 5.8 2.3 10.8c2.7 5.1 11.8 22.5 25.3 36 13.5 13.5 29.6 24.9 36 29.6 6.3 4.8 10.8 5.4 13.5 5.4 2.7 0 5.8-.4 8.1-2.9 2.3-2.5 5.1-5.1 8.1-6.3 3-1.3 7.9-2.7 15.8-6.3s13.5-9.5 15.8-15.8c2.3-6.3 4.5-13.5 4.5-15.8s-1.5-10.8-4.5-15.3c-3-4.5-17.6-22-22-26.7-4.5-4.8-10.8-7.5-15.3-7.5z'/%3E%3C/svg%3E");
    }
    .icon-social-telegram {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 496 512'%3E%3Cpath fill='black' d='M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm122.8 168.1L336 345c-4.4 16.5-14.8 18.1-24.2 11.4l-64.8-47.7-31.1 29.9c-3.4 3.3-6.1 6.1-12.3 6.1-6.9 0-6.7-3.4-9.3-9.9l-16.5-54.8-54.4-16.9c-16.5-5.2-16.5-15.3 3.4-23.4l214.2-83.8c14.2-5.4 27.5 4.2 23.9 20.9z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 496 512'%3E%3Cpath fill='black' d='M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm122.8 168.1L336 345c-4.4 16.5-14.8 18.1-24.2 11.4l-64.8-47.7-31.1 29.9c-3.4 3.3-6.1 6.1-12.3 6.1-6.9 0-6.7-3.4-9.3-9.9l-16.5-54.8-54.4-16.9c-16.5-5.2-16.5-15.3 3.4-23.4l214.2-83.8c14.2-5.4 27.5 4.2 23.9 20.9z'/%3E%3C/svg%3E");
    }
    .icon-social-pinterest {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 496 512'%3E%3Cpath fill='black' d='M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.8 71.8-163.8 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5.2-21.4 6.9-28 1.9-7.8-1-15.4-8.9-20.7-17.1-11.4-28.5-34.9-28.5-63 0-43.5 41.1-85.5 93.9-85.5 51.1 0 88.8 35.6 88.8 84.1 0 69.2-24.2 121.3-63.8 121.3-24.2 0-42.1-19.7-36.4-44.4 6.9-29.2 20.3-60.7 20.3-81.8 0-18-10.1-33.3-30.2-33.3-22.8 0-40.4 22.3-40.4 52.2 0 19.9 6.4 33.6 6.4 33.6l-24.5 103.1c-4.2 17.6-27.1 77.2-27.1 77.2-22.5 108.6 52.8 208.5 181.7 208.5 54.4 0 102.8-20.4 132.8-51.5 3.3-3.4 5.7-7.5 7.8-11.5 10.8-22.5 17.5-47.1 17.5-72.9 0-137-111-248-248-248z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 496 512'%3E%3Cpath fill='black' d='M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.8 71.8-163.8 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5.2-21.4 6.9-28 1.9-7.8-1-15.4-8.9-20.7-17.1-11.4-28.5-34.9-28.5-63 0-43.5 41.1-85.5 93.9-85.5 51.1 0 88.8 35.6 88.8 84.1 0 69.2-24.2 121.3-63.8 121.3-24.2 0-42.1-19.7-36.4-44.4 6.9-29.2 20.3-60.7 20.3-81.8 0-18-10.1-33.3-30.2-33.3-22.8 0-40.4 22.3-40.4 52.2 0 19.9 6.4 33.6 6.4 33.6l-24.5 103.1c-4.2 17.6-27.1 77.2-27.1 77.2-22.5 108.6 52.8 208.5 181.7 208.5 54.4 0 102.8-20.4 132.8-51.5 3.3-3.4 5.7-7.5 7.8-11.5 10.8-22.5 17.5-47.1 17.5-72.9 0-137-111-248-248-248z'/%3E%3C/svg%3E");
    }
    .icon-social-email {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM48 96h416c8.8 0 16 7.2 16 16v41.4c-21.9 18.5-53.2 44.2-150.2 125.2-17.5 14.3-38.1 22.4-59.8 22.4s-42.3-8.1-59.8-22.4C117.2 197.6 85.9 171.9 64 153.4V112c0-8.8 7.2-16 16-16zm0 320V195.4c22.5 18.2 55.4 45.4 153.8 126.3 21.5 17.6 47.4 26.3 74.2 26.3s52.7-8.7 74.2-26.3c98.4-80.9 131.3-108.1 153.8-126.3V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM48 96h416c8.8 0 16 7.2 16 16v41.4c-21.9 18.5-53.2 44.2-150.2 125.2-17.5 14.3-38.1 22.4-59.8 22.4s-42.3-8.1-59.8-22.4C117.2 197.6 85.9 171.9 64 153.4V112c0-8.8 7.2-16 16-16zm0 320V195.4c22.5 18.2 55.4 45.4 153.8 126.3 21.5 17.6 47.4 26.3 74.2 26.3s52.7-8.7 74.2-26.3c98.4-80.9 131.3-108.1 153.8-126.3V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16z'/%3E%3C/svg%3E");
    }
</style>