import React, { useState } from 'react';
import { BookOpenIcon } from './icons';

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-3 px-2 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
                <span className="font-semibold text-white">{title}</span>
                <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-900 text-gray-400 text-sm space-y-2">
                    {children}
                </div>
            )}
        </div>
    );
};

const ListItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <li>
        <strong className="text-gray-200">{title}:</strong> {children}
    </li>
);

export const PhotographyStudy: React.FC = () => {
    return (
        <div className="p-4 bg-gray-800 flex flex-col h-full">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center"><BookOpenIcon className="w-6 h-6 mr-2 text-blue-400" /> Estudo da Fotografia</h2>
            
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-md font-bold text-blue-400 mb-2">PARTE 1: A TÉCNICA E A ARTE</h3>
                        <p className="text-sm text-gray-400 mb-3">O estudo da fotografia é dividido em fundamentos técnicos, equipamentos, gêneros e teoria.</p>
                        <AccordionItem title="A. Fundamentos Técnicos (O Triângulo de Exposição)" defaultOpen>
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Exposição">A quantidade de luz que atinge o sensor.</ListItem>
                                <ListItem title="Abertura (f/stop)">Controla a luz e a profundidade de campo (f/1.4 para fundo desfocado, f/16 para tudo em foco).</ListItem>
                                <ListItem title="Velocidade do Obturador">Controla o tempo de luz e o movimento (1/1000s congela a ação, 1/30s cria desfoque de movimento).</ListItem>
                                <ListItem title="ISO">Sensibilidade do sensor à luz (ISO 100 para dias de sol, ISO 1600+ para pouca luz, mas pode gerar ruído).</ListItem>
                                <ListItem title="Modos de Exposição">Manual (M), Prioridade de Abertura (A/Av), Prioridade do Obturador (S/Tv), Programa (P), Automático (Auto).</ListItem>
                            </ul>
                        </AccordionItem>
                        <AccordionItem title="B. Composição e Estética">
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Regra dos Terços">Posicione elementos importantes nas interseções de um grid 3x3 imaginário.</ListItem>
                                <ListItem title="Linhas Guia">Use linhas na cena (estradas, rios) para guiar o olhar do espectador até o assunto.</ListItem>
                                <ListItem title="Enquadramento Natural">Use elementos como janelas ou arcos para criar uma moldura em torno do seu assunto.</ListItem>
                                <ListItem title="Simetria e Padrões">Criam harmonia visual e são agradáveis ao olhar.</ListItem>
                                <ListItem title="Espaço Negativo">Áreas vazias que ajudam a destacar o assunto principal.</ListItem>
                            </ul>
                        </AccordionItem>
                         <AccordionItem title="C. Equipamentos">
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Tipos de Câmera">DSLR, Mirrorless, Compactas, Médio Formato, Smartphones.</ListItem>
                                <ListItem title="Lentes (Distância Focal)">Ultra-wide (14mm), Wide (35mm), Normal (50mm), Teleobjetiva (85mm, 200mm+).</ListItem>
                                <ListItem title="Acessórios Essenciais">Tripé para estabilidade, Flash para luz adicional, Filtros (Polarizador, ND) para controlar luz e reflexos.</ListItem>
                            </ul>
                        </AccordionItem>
                        <AccordionItem title="D. Iluminação">
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Luz Natural">Aproveite a 'Golden Hour' (amanhecer/pôr do sol) para uma luz suave e dourada, ou a 'Blue Hour' para tons frios e atmosféricos.</ListItem>
                                <ListItem title="Luz Artificial">Use flash (speedlite) ou luz contínua (LED) com modificadores (softbox, sombrinha) para controlar a qualidade da luz.</ListItem>
                                <ListItem title="Padrões de Iluminamento">Rembrandt (triângulo de luz na bochecha), Borboleta (sombra sob o nariz), Lateral (drama e textura).</ListItem>
                            </ul>
                        </AccordionItem>
                        <AccordionItem title="E. Gêneros Fotográficos">
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Retrato">Foco em pessoas, capturando expressão e personalidade.</ListItem>
                                <ListItem title="Paisagem">Cenas da natureza ou urbanas, geralmente com grande profundidade de campo.</ListItem>
                                <ListItem title="Fotografia de Rua">Momentos espontâneos da vida cotidiana.</ListItem>
                                <ListItem title="Macro">Detalhes extremos de objetos pequenos.</ListItem>
                            </ul>
                        </AccordionItem>
                         <AccordionItem title="F. Pós-Produção (Fluxo de Trabalho)">
                             <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="RAW vs. JPEG">Fotografe em RAW para ter máxima flexibilidade na edição. JPEG é um formato final, já processado.</ListItem>
                                <ListItem title="Organização">Use softwares como Adobe Lightroom ou Capture One para organizar, classificar e selecionar suas melhores fotos antes de editar.</ListItem>
                            </ul>
                        </AccordionItem>
                    </div>

                     <div>
                        <h3 className="text-md font-bold text-blue-400 mb-2 mt-6">PARTE 2: EDIÇÃO DE FOTOS (PÓS-PRODUÇÃO)</h3>
                        <p className="text-sm text-gray-400 mb-3">A edição é onde a imagem final é construída. Pode ser feita em programas como Adobe Lightroom, Photoshop, Capture One, Affinity Photo, etc.</p>
                        <AccordionItem title="A. Ajustes Básicos e Globais">
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Balanço de Branco">Corrija a temperatura da cor para que os brancos pareçam brancos, não amarelados ou azulados.</ListItem>
                                <ListItem title="Exposição e Contraste">Ajuste o brilho geral e a diferença entre os tons claros e escuros.</ListItem>
                                <ListItem title="Realces e Sombras">Recupere detalhes em áreas muito claras (céus estourados) ou muito escuras.</ListItem>
                                <ListItem title="Vibração e Saturação">Aumente a intensidade das cores. 'Vibração' é mais sutil e protege os tons de pele.</ListItem>
                            </ul>
                        </AccordionItem>
                        <AccordionItem title="B. Ajustes Avançados e Locais">
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Curvas de Tons">Controle preciso sobre o brilho e contraste de diferentes áreas da imagem (sombras, tons médios, realces).</ListItem>
                                <ListItem title="HSL (Matiz, Saturação, Luminância)">Ajuste cada cor individualmente. Mude um céu azul para um tom mais ciano, ou escureça o verde das árvores.</ListItem>
                                <ListItem title="Máscaras Locais">Use filtros graduados, radiais ou pincéis para aplicar ajustes em áreas específicas da foto, como escurecer um céu.</ListItem>
                            </ul>
                        </AccordionItem>
                         <AccordionItem title="C. Edição Avançada (Photoshop)">
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Camadas e Máscaras">Trabalhe de forma não-destrutiva, aplicando edições em camadas separadas que podem ser ajustadas a qualquer momento.</ListItem>
                                <ListItem title="Seleções Precisas">Isole partes complexas da imagem, como cabelo, para aplicar edições específicas.</ListItem>
                                <ListItem title="Dodge & Burn">Clareie (dodge) e escureça (burn) seletivamente para adicionar profundidade, volume e direcionar o olhar do espectador.</ListItem>
                            </ul>
                        </AccordionItem>
                        <AccordionItem title="D. Correções e Manipulações">
                            <ul className="list-disc pl-5 space-y-2">
                                <ListItem title="Correção de Lente">Remova distorções e vinhetas causadas pela sua lente com perfis automáticos.</ListItem>
                                <ListItem title="Remoção de Objetos">Use ferramentas como o 'Spot Healing Brush' ou 'Content-Aware Fill' para remover distrações da sua foto.</ListItem>
                                <ListItem title="Nitidez (Sharpening)">Aplique nitidez de forma controlada para realçar detalhes, especialmente ao exportar para a web.</ListItem>
                                <ListItem title="Redução de Ruído">Suavize o grão gerado por fotos com ISO alto para uma imagem mais limpa.</ListItem>
                            </ul>
                        </AccordionItem>
                    </div>
                </div>
            </div>
        </div>
    );
};