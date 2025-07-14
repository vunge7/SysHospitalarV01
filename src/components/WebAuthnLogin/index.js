import { api } from '../service/api';

export default function WebAuthnLogin() {
    const username = 'usuarioTeste'; // Troque pelo usuário real

    // Cadastro (Registration)
    const handleRegister = async () => {
        // 1. Solicita opções de registro ao backend
        const { data: options } = await api.post('/webauthn/register/options', {
            username,
        });

        // 2. Chama WebAuthn no navegador
        options.challenge = Uint8Array.from(atob(options.challenge), (c) =>
            c.charCodeAt(0)
        );
        options.user.id = Uint8Array.from(atob(options.user.id), (c) =>
            c.charCodeAt(0)
        );
        const cred = await navigator.credentials.create({ publicKey: options });

        // 3. Envia resposta ao backend
        await api.post('/webauthn/register/finish', {
            id: cred.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(cred.rawId))),
            response: {
                attestationObject: btoa(
                    String.fromCharCode(
                        ...new Uint8Array(cred.response.attestationObject)
                    )
                ),
                clientDataJSON: btoa(
                    String.fromCharCode(
                        ...new Uint8Array(cred.response.clientDataJSON)
                    )
                ),
            },
            type: cred.type,
        });

        alert('Cadastro biométrico realizado!');
    };

    // Login (Authentication)
    const handleLogin = async () => {
        // 1. Solicita opções de login ao backend
        const { data: options } = await api.post('/webauthn/login/options', {
            username,
        });

        options.challenge = Uint8Array.from(atob(options.challenge), (c) =>
            c.charCodeAt(0)
        );
        if (options.allowCredentials) {
            options.allowCredentials = options.allowCredentials.map((cred) => ({
                ...cred,
                id: Uint8Array.from(atob(cred.id), (c) => c.charCodeAt(0)),
            }));
        }

        // 2. Chama WebAuthn no navegador
        const assertion = await navigator.credentials.get({
            publicKey: options,
        });

        // 3. Envia resposta ao backend
        await api.post('/webauthn/login/finish', {
            id: assertion.id,
            rawId: btoa(
                String.fromCharCode(...new Uint8Array(assertion.rawId))
            ),
            response: {
                authenticatorData: btoa(
                    String.fromCharCode(
                        ...new Uint8Array(assertion.response.authenticatorData)
                    )
                ),
                clientDataJSON: btoa(
                    String.fromCharCode(
                        ...new Uint8Array(assertion.response.clientDataJSON)
                    )
                ),
                signature: btoa(
                    String.fromCharCode(
                        ...new Uint8Array(assertion.response.signature)
                    )
                ),
                userHandle: assertion.response.userHandle
                    ? btoa(
                          String.fromCharCode(
                              ...new Uint8Array(assertion.response.userHandle)
                          )
                      )
                    : null,
            },
            type: assertion.type,
        });

        alert('Login biométrico realizado!');
    };

    return (
        <div>
            <button onClick={handleRegister}>Cadastrar biometria</button>
            <button onClick={handleLogin}>Login com biometria</button>
        </div>
    );
}
