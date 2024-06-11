interface SignUpTemplateArgs {
  name: string;
  verificationCode: string;
}

export default (args: SignUpTemplateArgs) => {
  return `
  <div class="middle-section" style="padding: 20px">
    <p>Olá, ${args.name}</p>
    <p>
      Aqui está o seu código de verificação: ${args.verificationCode}. Tenha em mente de que este código expira em 5 minutos, portanto finalize eu cadastro o quanto antes.
    </p>
  </div>`;
};
