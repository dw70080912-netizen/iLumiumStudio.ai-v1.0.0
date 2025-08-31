
import React, { useState } from 'react';
import { QuestionMarkCircleIcon } from './icons';

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
                <div className="p-4 bg-gray-800 text-gray-300 text-sm space-y-3 prose prose-invert prose-sm max-w-none">
                    {children}
                </div>
            )}
        </div>
    );
};

export const UserManual: React.FC = () => {
    return (
        <div className="p-4 bg-gray-800 flex flex-col h-full">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center"><QuestionMarkCircleIcon className="w-6 h-6 mr-2 text-blue-400" /> Manual do Usuário</h2>
            
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="space-y-4">
                    <AccordionItem title="1. Introdução e Conceitos Básicos" defaultOpen>
                        <p>Bem-vindo ao iLumium Studio! Esta aplicação foi projetada para oferecer um controle criativo sem precedentes sobre a geração e edição de imagens, utilizando o poder dos modelos de IA do Google.</p>
                        <p>A interface é dividida em duas áreas principais: o <strong>Painel de Ferramentas</strong> à esquerda, onde você controla as funções avançadas, e o <strong>Painel de Chat</strong> à direita, para interações rápidas e visualização dos resultados.</p>
                    </AccordionItem>
                    
                    <AccordionItem title="2. Perfis de Consistência: A Chave para a Coerência">
                        <p>A aba 'Perfis' é o coração da consistência visual. Ela permite que você "ensine" à IA a aparência de um personagem, objeto ou estilo específico para que possa reutilizá-lo em diferentes cenários.</p>
                        <h4>Como Criar um Perfil</h4>
                        <ul>
                            <li><strong>Na aba 'Perfis':</strong> Clique em 'Criar Novo Perfil', envie várias imagens de referência do seu sujeito (de ângulos e iluminações diferentes, se possível), e dê um nome único (ex: <code>meu_personagem_z</code>, sem espaços ou caracteres especiais).</li>
                            <li><strong>A partir de uma Imagem Gerada:</strong> Passe o mouse sobre qualquer imagem no chat e clique no ícone de Perfis (✨). Dê um nome e salve-a instantaneamente como um novo perfil de uma única imagem.</li>
                        </ul>
                        <h4>Como Usar um Perfil no Chat</h4>
                        <p>Simplesmente inclua o nome exato do perfil no seu prompt. Exemplo: "coloque <code>meu_personagem_z</code> em uma paisagem cyberpunk".</p>
                        <h4>Modos de Consistência:</h4>
                        <ul>
                            <li><strong>Normal:</strong> Equilíbrio padrão para uso geral.</li>
                            <li><strong>Profissional (Pro):</strong> Força a IA a gerar uma imagem com qualidade de estúdio, alta nitidez e iluminação perfeita.</li>
                            <li><strong>Amador:</strong> Simula fotos tiradas com celulares ou por fotógrafos inexperientes, com imperfeições realistas que você pode controlar.</li>
                            <li><strong>Realidade Fotográfica:</strong> Gera um "ensaio fotográfico" com múltiplas fotos, mantendo o personagem, roupas e cenário consistentes entre as tomadas, mas variando a pose.</li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="3. Estúdio Fotográfico: Controle Total">
                        <p>A aba 'Estúdio' é a sua ferramenta mais poderosa para criar imagens fotorrealistas com controle granular. Aqui, você age como um diretor de fotografia profissional.</p>
                        <ul>
                            <li><strong>Modo Diretor (Equipagem Automática):</strong> Se você não é um fotógrafo, ative esta opção. Descreva sua cena e a IA escolherá a melhor câmera, lente e configurações de iluminação para um resultado profissional.</li>
                            <li>
                                <strong>Controle Manual:</strong> Desative o Modo Diretor para ter acesso a todos os controles:
                                <ul className="list-[circle] pl-5 mt-2 space-y-2">
                                    <li><strong>Iluminação:</strong> Defina a hora do dia, a fonte de luz (sol, flash de estúdio, neon), o ângulo e a dureza das sombras.</li>
                                    <li>
                                        <strong>Câmera e Lente:</strong> Simule câmeras reais, de um iPhone a uma Hasselblad de médio formato.
                                        <ul className="list-[square] pl-5 mt-2">
                                            <li><strong>Tipo de Sensor:</strong> Sensores maiores (Full-Frame, Médio Formato) capturam mais luz e detalhe, ideal para retratos e paisagens com alta qualidade. Sensores menores (APS-C) são mais compactos. Sensores de smartphone dependem de software (fotografia computacional) para compensar seu tamanho físico.</li>
                                            <li><strong>Distância Focal e Abertura:</strong> Uma lente de 35mm f/1.8 é ótima para fotografia de rua, capturando o ambiente. Uma lente de 85mm f/1.4 é perfeita para retratos, desfocando o fundo lindamente (bokeh).</li>
                                            <li><strong>Distorção da Lente:</strong> Simula como as lentes podem distorcer a imagem. 'Barril' (Barrel) curva as linhas retas para fora, comum em lentes grande-angulares. 'Almofada' (Pincushion) curva as linhas para dentro, comum em lentes zoom.</li>
                                            <li><strong>Aberração Cromática:</strong> Simula falhas ópticas onde a lente não consegue focar todas as cores no mesmo ponto, criando franjas coloridas (geralmente roxas) em áreas de alto contraste. Use para um look 'vintage' ou de baixa fidelidade.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <strong>Simulação de Filme e Defeitos:</strong> Dê um look autêntico à sua imagem.
                                        <ul className="list-[square] pl-5 mt-2">
                                            <li><strong>Kodak Portra 400:</strong> Use para retratos com tons de pele naturais e quentes, com saturação suave.</li>
                                            <li><strong>Fuji Velvia 50:</strong> Perfeito para paisagens, com cores vibrantes e alta saturação, especialmente em verdes e azuis.</li>
                                            <li><strong>CineStill 800T:</strong> Ideal para cenas noturnas e urbanas para obter um look cinematográfico com brilhos avermelhados (halation) em torno das fontes de luz.</li>
                                            <li><strong>Ilford HP5 400:</strong> Um clássico filme preto e branco com granulação marcante e alto contraste.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Efeitos Atmosféricos:</strong> Adicione efeitos como neblina, chuva ou partículas de poeira para criar profundidade e atmosfera.</li>
                                </ul>
                            </li>
                            <li><strong>Integração com o Chat:</strong> Passe o mouse sobre uma imagem gerada e clique no ícone 'Estúdio' para enviá-la diretamente para cá como uma imagem base, pronta para ser reiluminada ou editada.</li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="4. Laboratório de Imagens (Lab): A Arte da Composição">
                        <p>A aba 'Lab' permite combinar múltiplas fontes (imagens e texto) para criar uma imagem final coesa. É como uma mesa de montagem para a IA.</p>
                        <p><strong>Como usar:</strong></p>
                        <ol>
                            <li><strong>Personagem/Objeto:</strong> Forneça imagens ou uma descrição do seu sujeito principal.</li>
                            <li><strong>Cenário:</strong> Faça o mesmo para o ambiente ou fundo.</li>
                            <li><strong>Estilo:</strong> Envie imagens de referência para o estilo de iluminação, paleta de cores ou tipo de arte que você deseja.</li>
                            <li><strong>Extras:</strong> Adicione outros elementos à cena.</li>
                        </ol>
                        <p>A IA irá "mixar" todas essas informações para gerar um resultado que combina os elementos de forma harmoniosa.</p>
                    </AccordionItem>

                    <AccordionItem title="5. Ferramentas de Edição e Análise">
                        <p>Um conjunto de ferramentas para tarefas específicas que complementam o fluxo de trabalho principal.</p>
                        <ul>
                            <li><strong>Edição Avançada:</strong> Para edições rápidas e diretas. Envie uma imagem base, defina o que modificar (o sujeito), o que fazer (a ação) e gere. Ideal para mudanças pontuais.</li>
                            <li><strong>Expandir Imagem:</strong> Ferramenta de "outpainting". Envie uma imagem, escolha uma nova proporção (ex: de quadrado para paisagem) e a IA completará o que falta na cena de forma inteligente.</li>
                            <li><strong>Volumetria (Experimental):</strong> Tente recriar uma imagem a partir de um novo ângulo de câmera. Envie a foto e descreva a nova perspectiva (ex: "vista de cima", "ângulo holandês"). Os resultados podem variar.</li>
                            <li><strong>Analisador de Imagem:</strong> Não sabe como descrever o estilo de uma foto? Envie-a aqui. A IA gerará um prompt técnico detalhado descrevendo a iluminação, lente e composição, que você pode usar para recriar um estilo semelhante.</li>
                        </ul>
                    </AccordionItem>
                    
                    <AccordionItem title="6. Dicas de Fluxo de Trabalho">
                        <ul>
                            <li><strong>Do Chat para as Ferramentas:</strong> O fluxo de trabalho mais eficiente é gerar uma imagem base no chat usando um Perfil e, em seguida, usar os botões de ação na imagem para enviá-la ao 'Estúdio' para refinamento, à 'Edição' para ajustes rápidos, ou ao 'Expandir' para mudar o enquadramento.</li>
                            <li><strong>Aprenda com o Analisador:</strong> Use a aba 'Analisador' com suas fotos favoritas para aprender a "linguagem" da fotografia e como descrever luz, lentes e composição de forma eficaz para a IA.</li>
                            <li><strong>Combine Ferramentas:</strong> Use o 'Expandir' para criar um novo enquadramento e, em seguida, envie a imagem expandida para o 'Estúdio' para ajustar a iluminação da nova cena. As possibilidades são infinitas.</li>
                        </ul>
                    </AccordionItem>

                </div>
            </div>
        </div>
    );
};
