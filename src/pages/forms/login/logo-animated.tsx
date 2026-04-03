
const LogoAnimated: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-transparent mt-4"
            style={{ height: '120px' }}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-48 h-48 max-h-36 animate-sunrise"
                viewBox="0 0 100 100"
                fill="currentColor"
            >
                <circle cx="50" cy="45" r="20" fill="#0f68b6" />
                <g transform="translate(50, 43)" fill="none" stroke="#cadef8" stroke-width="1.5">
                    <rect x="-8" y="-5" width="16" height="10" fill="white" />
                    <path d="M -8 -5 L 8 -5 L 5 -8 L -5 -8 Z" fill="white" />
                    <circle cx="0" cy="-3" r="1.2" fill="yellow" />
                </g>
                <svg viewBox="0 0 24 26" xmlns="http://www.w3.org/2000/svg" width="175" height="26" fill="none">
                    <path stroke="#0A0A30" stroke-width="1.5" d="M5.9 8.053a2 2 0 011.507-1.938l4.683-1.192 4.517 1.184A2 2 0 0118.1 8.042v3.75a7 7 0 01-3.98 6.314l-.755.361a3 3 0 01-2.557.015l-.856-.398A7 7 0 015.9 11.736V8.053z" />
                    <path stroke="#265BFF" stroke-linecap="round" stroke-width="1.5" d="M9.215 12.052l1.822 1.805 3.748-3.714" style={{ animation: 'check 2s infinite cubic-bezier(.99,-.1,.01,1.02)' }} stroke-dashoffset="100" stroke-dasharray="100" />
                </svg>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                    <rect width="12" height="10" x="6" y="8.804" stroke="#0A0A30" stroke-width="1.5" rx="2" />
                    <path fill="#fff" stroke="#265BFF" stroke-width="1.5" d="M9 6.196a1 1 0 011-1h4a1 1 0 011 1v5.082a1 1 0 01-.37.777l-2.006 1.628a1 1 0 01-1.263-.002l-1.993-1.626A1 1 0 019 11.28V6.196z" style={{ animation: 'open 2s cubic-bezier(.49,.39,.35,1.06) both infinite' }} />
                    <path stroke="#0A0A30" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.465 11.413l3.573 2.783 3.497-2.783" />
                </svg>
                <svg viewBox="4 0 26 14" xmlns="http://www.w3.org/2000/svg" width="24" height="88" fill="none">
                    <path stroke="#0A0A30" stroke-width="1.5" d="M17.82 16.889a7 7 0 001.162-3.39A.473.473 0 0018.5 13h-6a.5.5 0 01-.5-.5v-6a.473.473 0 00-.5-.482 7 7 0 106.32 10.871z" />
                    <path stroke="#265BFF" stroke-width="1.5" d="M19 11c.552 0 1.009-.45.917-.995a6 6 0 00-4.922-4.922C14.451 4.992 14 5.448 14 6v4a1 1 0 001 1h4z" style={{ animation: 'slide-tr 1s cubic-bezier(.47,0,.745,.715) infinite alternate-reverse both' }} />
                </svg>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" x="81" y="6" width="24" height="88" fill="none">
                    <g style={{ animation: 'rotate 3s cubic-bezier(.7,-.03,.26,1.05) both infinite;transform-origin:center center' }} stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                        <path stroke="#0A0A30" d="M5.262 15.329l.486.842a1.49 1.49 0 002.035.55 1.486 1.486 0 012.036.529c.128.216.197.463.2.714a1.493 1.493 0 001.493 1.536h.979a1.486 1.486 0 001.485-1.493 1.493 1.493 0 011.493-1.471c.252.002.498.071.714.2a1.493 1.493 0 002.036-.55l.521-.857a1.493 1.493 0 00-.542-2.036 1.493 1.493 0 010-2.586c.71-.41.952-1.318.543-2.028l-.493-.85a1.493 1.493 0 00-2.036-.579 1.479 1.479 0 01-2.029-.543 1.428 1.428 0 01-.2-.714c0-.825-.668-1.493-1.492-1.493h-.98c-.82 0-1.488.664-1.492 1.486a1.485 1.485 0 01-1.493 1.493 1.521 1.521 0 01-.714-.2 1.493 1.493 0 00-2.036.542l-.514.858a1.486 1.486 0 00.543 2.035 1.486 1.486 0 01.543 2.036c-.13.226-.317.413-.543.543a1.493 1.493 0 00-.543 2.028v.008z" clip-rule="evenodd" />
                        <path stroke="#265BFF" d="M12.044 10.147a1.853 1.853 0 100 3.706 1.853 1.853 0 000-3.706z" />
                    </g>
                </svg>
                <g className="sun-rays">
                    <line x1="50" y1="20" x2="50" y2="4" className="ray delay-1" />
                    <line x1="50" y1="70" x2="50" y2="85" className="ray delay-2" />
                    <line x1="30" y1="30" x2="20" y2="20" className="ray delay-3" />
                    <line x1="70" y1="70" x2="80" y2="80" className="ray delay-4" />
                    <line x1="17" y1="50" x2="27" y2="50" className="ray delay-5" />
                    <line x1="72" y1="50" x2="82" y2="50" className="ray delay-6" />
                    <line x1="30" y1="70" x2="20" y2="80" className="ray delay-7" />
                    <line x1="70" y1="30" x2="80" y2="20" className="ray delay-8" />
                </g>
                <text
                    x="50"
                    y="100"
                    text-anchor="middle"
                    font-size="16"
                    fill="#0f68b6"
                    font-family="Arial, sans-serif"
                    font-weight="bold"
                >
                    Dashboard Web 1.0
                </text>
            </svg>
        </div>)
};

export default LogoAnimated;