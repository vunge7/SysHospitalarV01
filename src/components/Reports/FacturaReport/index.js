import jsPDF from 'jspdf';
import 'jspdf-autotable';

import logo from './images/logo.jpg';
var doc = new jsPDF();

const cabecario = async (values) => {
    const carregarImagemDeCaminho = async (caminho) => {
        const resposta = await fetch(caminho);
        const blob = await resposta.blob();
        return new Promise((resolve) => {
            const leitor = new FileReader();
            leitor.onloadend = () => resolve(leitor.result);
            leitor.readAsDataURL(blob); // Retorna em base64
        });
    };

    const dadosInstituicao = async (values) => {
        const file = await carregarImagemDeCaminho(logo);

        if (file) {
            doc.addImage(file, 'JPEG', 10, 5, 25, 20);
            doc.setFontSize(10);
            doc.text(values.nome, 10, 30);
            doc.text('Nif:' + values.nif, 10, 34);
            doc.text('Tel.:' + values.telefone, 10, 38);
            doc.text('Email: ' + values.email, 10, 42);
            doc.text('Endereço:' + values.endereco, 10, 46);
        }
    };

    const cliente = (values) => {
        let x = 130;
        let y = 40;
        doc.text(values.nome, x, y);
        doc.text('Nif:' + values.nif, x, y + 4);
        doc.text('Tel.:' + values.telefone, x, y + 8);
        doc.text('Email: ' + values.email, x, y + 12);
        doc.text('Endereço:' + values.endereco, x, y + 16);
    };

    await dadosInstituicao(values.dadosInstituicao);
    cliente(values.cliente);
};

const resumo = (values) => {
    let x = 130;
    // Adicionar Resumo após a Tabela
    const finalY = doc.lastAutoTable.finalY; // Posição onde a tabela terminou
    doc.setFontSize(10);
    doc.text('Total Iliquido: ' + values.totalIliquido, x, finalY + 10);
    doc.setFontSize(10);
    doc.text('Total Iva: ' + values.totalIva, x, finalY + 15);
    doc.text('Total Desconto: ' + values.totalDesconto, x, finalY + 20);
    doc.setFontSize(11);
    doc.text('Total Líquido: ' + values.totalLiquido, x, finalY + 25);
};

const footer = (currentPage, totalPages) => {
    doc.setFontSize(10);
    doc.text(
        `Página ${currentPage} de ${totalPages}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
    );
};

// Configuração do Rodapé em todas as páginas
const paginacao = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        footer(i, pageCount);
    }
};

const corpo = (values) => {
    doc.autoTable({
        head: [values.head],
        body: values.lines,
        startY: 65, // Começa abaixo do cabeçalho
        theme: 'striped',
        styles: { fontSize: 10 },
        margin: { top: 10, left: 10 },
    });
};

const carregarImagemDeCaminho = async (caminhoImagem) => {
    try {
        const resposta = await fetch(caminhoImagem);
        const blob = await resposta.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(blob);
        });
    } catch (erro) {
        console.error('Erro ao carregar a imagem:', erro);
    }
};

export const gerarDocumento = async (header, detail, summary) => {
    await cabecario(header);
    corpo(detail);
    resumo(summary);
    paginacao();
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    // Abre o PDF em uma nova aba
    window.open(url);
};
