  "use client";

  import { createContext, useContext, useMemo, ReactNode, useRef, useLayoutEffect, useState, useCallback, useEffect, useEffectEvent } from "react";
  import { useHomeData } from "./home_context";
  import { useParams, usePathname } from "next/navigation";
  import constantes from "../app/(home)/JSON/constantes.json";

  const NineteenContext = createContext<any>(null);

  export function NineteenProvider({ children }: { children: ReactNode }) {

    // ---------------------------------------------------------------
    // ---------------- PARÂMETROS PARA CARGA DINÂMICA ---------------
    // ---------------------------------------------------------------

    const params = useParams();
    const currentYear = params.year;

    // ------------------------------------------------------
    // ---------------- CONTEXTOS NECESSÁRIOS ---------------
    // ------------------------------------------------------

    const { deferredArea, selectedRowId, chartLogic } = useHomeData();
    const { selectedLabel, currentInfo } = chartLogic
    const [lastItemActivate, setLastItemActivate] = useState<number>(0);
    const [selectedItems, setSelectedItems] = useState<Record<number, any>>({});
    const [isDigital, setIsDigital] = useState<boolean>(false)

    useEffect(() => {
      if (!currentInfo || !currentInfo.corNome) return;
      const versao = currentInfo.corNome.includes("Digital") ? "digital" : "regular"
      versao === "digital" ? setIsDigital(true) : setIsDigital(false) 
    }, [currentInfo, deferredArea])

    // --------------------------------------------------------------------------------
    // ---------------- CARGA DINÂMICA DE JSON POR ANO (BUNDLE INICIAL) ---------------
    // --------------------------------------------------------------------------------

    // 2019 DATA
    const [itensData, setItensData] = useState<any>(null);
    const [Inscritos, setInscritos] = useState<any>(null);
    const [Abstencao_dia1, setAbstencao_dia1] = useState<any>(null);
    const [Abstencao_dia2, setAbstencao_dia2] = useState<any>(null);
    const [presence_data, setPresence_data] = useState<any>(null);
    const [cor_raca_data, setCor_raca_data] = useState<any>(null);
    const [sexo_data, setSexo_data] = useState<any>(null);
    const [fx_etaria_data, setFx_etaria_data] = useState<any>(null);
    const [scoreData, setScoreData] = useState<any>(null);
    const [competenciaRowData, setCompetenciaRowData] = useState<any>(null);
    const [statusData, setStatusData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function loadYearlyData() {
        setLoading(true);
        try {
          const [
            itens, 
            inscritos, 
            abstencao1,
            abstencao2,
            presence,
            cor_raca,
            sexo,
            fx_etaria,
            score,
            competencia,
            status
          ] = await Promise.all([
            // 2019 data
            import(`../app/(home)/JSON/${currentYear}/itens_${currentYear}.json`),
            import(`../app/(home)/JSON/${currentYear}/visao-geral/overview/inscritos.json`),
            import(`../app/(home)/JSON/${currentYear}/visao-geral/overview/presenca_dia1.json`),
            import(`../app/(home)/JSON/${currentYear}/visao-geral/overview/presenca_dia2.json`),
            import(`../app/(home)/JSON/${currentYear}/visao-geral/overview/presenca.json`),
            import(`../app/(home)/JSON/${currentYear}/visao-geral/socials/cor_raca.json`),
            import(`../app/(home)/JSON/${currentYear}/visao-geral/socials/sexo.json`),
            import(`../app/(home)/JSON/${currentYear}/visao-geral/socials/faixa_etaria.json`),
            import(`../app/(home)/JSON/${currentYear}/resposta-ao-item/score_table.json`),
            import(`../app/(home)/JSON/${currentYear}/redacao/estatisticas_redacao_completa.json`),
            import(`../app/(home)/JSON/${currentYear}/redacao/status_redacao.json`),
          ]);
          setItensData(itens.default);
          setInscritos(inscritos.default)
          setAbstencao_dia1(abstencao1.default)
          setAbstencao_dia2(abstencao2.default)
          setPresence_data(presence.default)
          setCor_raca_data(cor_raca.default)
          setSexo_data(sexo.default)
          setFx_etaria_data(fx_etaria.default)
          setScoreData(score.default)
          setCompetenciaRowData(competencia.default)
          setStatusData(status.default)
        } catch (err) {
          console.error(`Erro ao carregar dados do ano ${currentYear}:`, err);
        } finally {
          setLoading(false);
        }
      }
      loadYearlyData();
    }, [currentYear]);

    const [densityDifData, setDensityDifData] = useState<any>(null);
    const [describeDifData, setDescribeDifData] = useState<any>(null);
    const [frequencyDifData, setFrequencyDifData] = useState<any>(null);

    useEffect(() => {
      const loadData = async () => {
        let density;
        let describe;
        let frequency;
        switch (deferredArea) {
          case 'CH':
            density = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/CH/density.json`);
            describe = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/CH/describe.json`);
            frequency = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/CH/frequency_acertos.json`);
            break;
          case 'CN':
            density = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/CN/density.json`);
            describe = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/CN/describe.json`);
            frequency = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/CN/frequency_acertos.json`);
            break;
          case 'MT':
            density = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/MT/density.json`);
            describe = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/MT/describe.json`);
            frequency = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/MT/frequency_acertos.json`);
            break;
          default:
            density = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/LC/density.json`);
            describe = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/LC/describe.json`);
            frequency = await import(`../app/(home)/JSON/${currentYear}/dificuldade-do-exame/LC/frequency_acertos.json`);
        }
        setDensityDifData(isDigital ? density.default.digital : density.default.regular);
        setDescribeDifData(isDigital ? describe.default.digital : describe.default.regular);
        setFrequencyDifData(isDigital ? frequency.default.digital : frequency.default.regular)
      };
      loadData();
    }, [deferredArea, isDigital]);

    // ---------------------------------------------------------------------
    // ---------------- CARGA DINÂMICA DE JSON POR ANO (API) ---------------
    // ---------------------------------------------------------------------

    const [infoData, setInfoData] = useState<any>(null);
    const [co_p_selected] = selectedLabel.split('_');
    const [probData, setProbData] = useState<any>(null);
    const [probLabels, setProbLabels] = useState<any>([]);
    const [infoLabels, setInfoLabels] = useState<any>([]);

    const probCache = useRef<{ co_p: string; dataset: any; labels: any } | null>(null);
    const infoCache = useRef<{ co_p: string; dataset: any; labels: any } | null>(null);
    
    useEffect(() => {
      if (!co_p_selected) return;
      if (probCache.current?.co_p === co_p_selected) {
        setProbData(probCache.current.dataset);
        setProbLabels(probCache.current.labels);
        return;
      }
      async function fetchProbData() {
        try {
          const res = await fetch(`/api/probtrace?co_p=${String(co_p_selected)}&year=${currentYear}`);
          const json = await res.json();        
          probCache.current = {
            co_p: co_p_selected,
            dataset: json.dataset,
            labels: json.theta_labels
          };
          setProbData(json.dataset);
          setProbLabels(json.theta_labels);
        } catch (err) {
          console.error("Erro ao carregar probtrace:", err);
        } 
      }
      async function fetchInfoData() {
        try {
          const res = await fetch(`/api/info?co_p=${String(co_p_selected)}&year=${currentYear}`);
          const json = await res.json();        
          infoCache.current = {
            co_p: co_p_selected,
            dataset: json.dataset,
            labels: json.theta_labels
          };
          setInfoData(json.dataset);
          setInfoLabels(json.theta_labels);
        } catch (err) {
          console.error("Erro ao carregar infotrace:", err);
        } 
      }

      fetchProbData();
      fetchInfoData();

    }, [co_p_selected]);

    const [itemGraphData, setItemGraphData] = useState<any>(null);
    const itemGraphCache = useRef<{ code: number; dataset: any } | null>(null);
    
    useEffect(() => {
      if (! lastItemActivate) return;
      if (itemGraphCache.current?.code === lastItemActivate) {
        setItemGraphData(itemGraphCache.current.dataset);
        return;
      }
      async function fetchItemData() {
        try {
          const res = await fetch(`/api/score_graph?code=${String(lastItemActivate)}&year=${currentYear}`);
          const json = await res.json();        
          itemGraphCache.current = {
            code: lastItemActivate,
            dataset: json?.dataset,
          };
          setItemGraphData(json?.dataset);
        } catch (err) {
          console.error("Erro ao carregar item_score:", err);
        } 
      }
      fetchItemData();
    }, [lastItemActivate]);

    const [acertosNum, setAcertosNum] = useState<number | null>(null);
    const [acertosData, setAcertosData] = useState<any>(null); 
    const acertosCache = useRef<{ area: string; dataset: any, versao: string } | null>(null);

    useEffect(() => {

      const tipo = isDigital ? "digital" : "regular"
      
      if (acertosCache.current?.area === deferredArea && 
          acertosCache.current?.versao === tipo) {
        setAcertosData(acertosCache.current.dataset);
        return;
      }

      async function fetchAcertosData() {
        try {
          const targetArea = deferredArea || 'LC';
          const res = await fetch(`/api/acertos?area=${String(targetArea)}&year=${currentYear}`);
          const json = await res.json();  
          if (json.dataset) {
            acertosCache.current = {
              area: String(targetArea),
              dataset: isDigital ? json.dataset.digital : json.dataset.regular,
              versao: tipo
            };
            setAcertosData(isDigital ? json.dataset.digital : json.dataset.regular);
          }
        } catch (err) {
          console.error("Erro ao carregar item_score:", err);
        } 
      }

      fetchAcertosData();
    }, [deferredArea, currentInfo, isDigital]);

    const [EAPData, setEAPData] = useState<any>(null);
    const [sampleEAP, setSampleEAP] = useState<string>("000000000000000000000000000000000000000000000");
    const [updateTrigger, setUpdateTrigger] = useState(false);

    useEffect(() => {
      if (!selectedLabel) return null
      const [codigo, lingua] = selectedLabel.split('_');
      async function fetchEAPData() {
        try {
          const res = await fetch(`/api/eap?sample=${sampleEAP}&area=${deferredArea}&ano=${currentYear}&codigo=${codigo}&lingua=${lingua}`);
          if (!res.ok) throw new Error("Erro na rota interna");
          const json = await res.json();  
          if (json) {
            setEAPData(json);
          }
        } catch (err) {
          console.error("Erro ao carregar EAPdata:", err);
        } 
      }
      if (Object.entries(selectedItems).length !== 0) fetchEAPData();
    }, [updateTrigger]);

    //--------------------------------------------------------------------------
    //---------------------------DIFICULDADE DO EXAME---------------------------
    //--------------------------------------------------------------------------

    const labelMap: Record<string, string> = {
      mean: "Média", median: "Mediana", mode: "Moda", sd: "Desvio Padrão",
      min: "Mínima¹", max: "Máxima²", skew: "Assimetria", kurtosis: "Curtose",
      q1: "1º quartil", q3: "3º quartil", p99: "Percentil 99"
    };

    const rowOrder = ["mean", "median", "mode", "min", "max", "sd", "q1", "q3", "p99", "skew", "kurtosis"];

    const formatValue = (key: string, val: any, type: 'nota' | 'acerto') => {
      if (typeof val !== "number") return val;
      const isSpecial = key === 'skew' || key === 'kurtosis';
      return val.toLocaleString('pt-BR', { 
        maximumFractionDigits: isSpecial ? 2 : (type === 'nota' ? 1 : 0), 
        minimumFractionDigits: 0 
      });
    };

    const tableData = useMemo(() => {
      if (!describeDifData?.notas) return [];
      return rowOrder
        .filter(key => describeDifData.notas[key] !== undefined)
        .map((key) => ({
          id: key, 
          metric: labelMap[key] || key,
          nota: formatValue(key, describeDifData.notas[key], 'nota'),
          acerto: formatValue(key, describeDifData.acertos?.[key], 'acerto')
        }));
    }, [describeDifData, deferredArea]);

    const describeRowData = useMemo(() => ({
      data: tableData,
      n: describeDifData?.notas?.n || 0,
      raw: describeDifData,
      cod_min_ref: describeDifData?.notas?.cod_min,
      cod_max_ref: describeDifData?.notas?.cod_max,
      cor_min_ref: describeDifData?.notas?.cor_min,
      cor_max_ref: describeDifData?.notas?.cor_max
    }), [tableData, describeDifData]);

    
    const activeSelectedRow = useMemo(() => {
      return tableData.find(row => row.id === selectedRowId) || null;
    }, [tableData, selectedRowId]);

    //------------------------------------------------------------------------
    //--------------------------PROBABILIDADE E INFO--------------------------
    //------------------------------------------------------------------------

    const abandonadosCodes = useMemo(() => {
      const codes = new Set<number>();
      const data = itensData; 
      
      // Se o dado ainda não carregou, retorna o set vazio sem quebrar
      if (!data || !data.CO_ITEM) return codes;

      data.CO_ITEM.forEach((code: number, index: number) => {
        if (data.IN_ITEM_ABAN && data.IN_ITEM_ABAN[index] === 1) {
          codes.add(code);
        }
      });
      return codes;
    }, [itensData]);

    // Paleta fixa para os 45 itens
    const FIXED_PALETTE = useMemo(() => 
      Array.from({ length: 45 }, (_, i) => `hsl(${(i * 360) / 45}, 70%, 50%)`), 
    []);

    const areaIdx = constantes.area.indexOf(deferredArea || "LC");
    const d = constantes.d[areaIdx];
    const k = constantes.k[areaIdx];

    const [lastItemActivateNum, setLastItemActivateNum] = useState<number>(0);
    const prevLabelRef = useRef(selectedLabel);
    const previousLabel = prevLabelRef.current;

    // Função para traduzir Posição (ex: questão 95) em Código (ex: 11234)
    const getCodeByLabel = useCallback((num: number, label: string) => {
      if (!label || !itensData || !itensData.CO_POSICAO) return null; // Check de segurança
      const [co_p, ling, vers] = label.split('_');
      const p = itensData;   
      const idx = Object.keys(p.CO_POSICAO).find(i => {
        const matchProva = Number(p.CO_PROVA[i]) === Number(co_p);
        const matchPos = Number(p.CO_POSICAO[i]) === num;
        if (!matchProva || !matchPos) return false;
        if (deferredArea === 'LC' && num <= 5 && ling !== undefined) {
          return Number(p.TP_LINGUA[i]) === Number(ling);
        }
        if (vers === "D" && p.TP_VERSAO_DIGITAL) {
          if (Number(vers) !== p.TP_VERSAO_DIGITAL[i]) return false;
        }
        return true;
      });
      return idx ? Number(p.CO_ITEM[idx]) : null;
    }, [deferredArea, itensData]);

    // Função para traduzir Posição (ex: questão 95) em Código (ex: 11234)
    const getParamByLabel = useCallback((num: number, label: string, type: string) => {
      if (!label || !itensData || !itensData.CO_POSICAO) return null; 
      const [co_p, ling, vers] = label.split('_');
      const p = itensData;   
      const idx = Object.keys(p.CO_POSICAO).find(i => {
        const matchProva = Number(p.CO_PROVA[i]) === Number(co_p);
        const matchPos = Number(p.CO_POSICAO[i]) === num;
        if (!matchProva || !matchPos) return false;
        if (deferredArea === 'LC' && num <= 5 && ling !== undefined) {
          return Number(p.TP_LINGUA[i]) === Number(ling);
        }
        if (vers === "D" && p.TP_VERSAO_DIGITAL) {
          if (Number(vers) !== p.TP_VERSAO_DIGITAL[i]) return false;
        }
        return true;
      });
      const map = {
        a: p.NU_PARAM_A?.[idx],
        b: p.NU_PARAM_B?.[idx],
        c: p.NU_PARAM_C?.[idx]
      };

      const val = map[type];
      return idx ? Number(val) : null;
    }, [deferredArea, itensData]);

    const handleToggle = useCallback((num: number, isAbandoned: boolean) => {
      // Usamos o selectedLabel atual para descobrir qual o código do item no momento do clique
      const codeItem = getCodeByLabel(num, selectedLabel);
      
      if (!codeItem) {
        console.warn(`Não foi possível encontrar o código para a posição ${num} na prova ${selectedLabel}`);
        return;
      }

      setLastItemActivate(codeItem);

      setSelectedItems(prev => {
        const nextMapping = { ...prev };
        const current = nextMapping[codeItem];

        if (isAbandoned) {
          // Se for abandonado: Toggle simples entre selecionado (cinza) e nada
          if (current) {
            delete nextMapping[codeItem];
          } else {
            nextMapping[codeItem] = { status: 'anulado', posicao: num };
          }
          return nextMapping;
        }

        // Lógica de ciclo: Nada -> Acerto (verde) -> Erro (vermelho) -> Nada
        if (!current) {
          nextMapping[codeItem] = { status: 'acerto', posicao: num };
        } else if (current.status === 'acerto') {
          nextMapping[codeItem] = { status: 'erro', posicao: num };
        } else {
          delete nextMapping[codeItem];
        }      
        return nextMapping;
      });
    }, [selectedLabel, getCodeByLabel]);

    useLayoutEffect(() => {
      if (previousLabel === selectedLabel) return;

      const ranges: Record<string, { start: number; end: number }> = {
        "LC": { start: 1, end: 45 },
        "CH": { start: 46, end: 90 },
        "CN": { start: 91, end: 135 },
        "MT": { start: 136, end: 180 },
      };

      const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };

      setSelectedItems(prev => {
        const currentlySelectedCodes = Object.keys(prev).map(Number);
        if (currentlySelectedCodes.length === 0) return prev;
        const nextMapping: Record<number, any> = {};      
        const translationMap = new Map();
        for (let num = start; num <= end; num++) {
          const oldCode = getCodeByLabel(num, previousLabel);
          const newCode = getCodeByLabel(num, selectedLabel);
          
          if (oldCode && newCode) {
            translationMap.set(oldCode, { newCode, posicao: num });
          }
        }
        currentlySelectedCodes.forEach(oldCode => {
          const translation = translationMap.get(oldCode);
          if (translation) {
            nextMapping[translation.newCode] = {
              ...prev[oldCode],
              posicao: translation.posicao
            };
          } else {
            nextMapping[oldCode] = prev[oldCode];
          }
        });
        return nextMapping;
      });
      prevLabelRef.current = selectedLabel;
    }, [selectedLabel, getCodeByLabel, deferredArea]);

    const activeCodes = useMemo(() => {
      const codes = Object.keys(selectedItems).map(Number);
      return codes.filter(code => 
        String(code) in (probData || {})
      );
    }, [selectedItems, probData, abandonadosCodes]);

    //--------------------------------------------------------
    //--------------------------EAP---------------------------
    //--------------------------------------------------------
    
    const intervalData = useMemo(() => {
      const ranges = {
        "LC": { start: 1, end: 45 }, 
        "CH": { start: 46, end: 90 },
        "CN": { start: 91, end: 135 }, 
        "MT": { start: 136, end: 180 },
      };    
      
      const { start, end } = ranges[deferredArea as keyof typeof ranges] || { start: 1, end: 45 };
      const updatedInterval = Array(45).fill('0'); 

      activeCodes.forEach((codigo: number) => {
        const itemMarcado = selectedItems[codigo];
        if (itemMarcado && itemMarcado.status === "acerto") {
          const pos = itemMarcado.posicao;
          if (pos >= start && pos <= end) {
            const index = pos - start;
            if (index >= 0 && index < 45) {
              updatedInterval[index] = '1';
            }
          }
        }
      });

      return updatedInterval.join('');
    }, [deferredArea, activeCodes, selectedItems ]);

    //---------------------------------------------------------
    //--------------------------MEAN---------------------------
    //---------------------------------------------------------

    const [activeRanking, setActiveRanking] = useState<number | null>(1); 
    const [top2000Data, setTop2000Data] = useState<any>();
    const [candidateData, setCandidateData] = useState<any>();
    const pathname = usePathname();

    useEffect(() => {
      const isMediaSimplesPage = pathname?.endsWith('/media-simples');
      async function fetchTop2000Data() {
        if (!isMediaSimplesPage || !currentYear) return;
        try {
          const res = await fetch(`/api/mean?year=${currentYear}`);
          const json = await res.json();
          setTop2000Data(json)
        } catch (err) {
          console.error("Erro ao carregar probtrace:", err);
        } 
      }
      fetchTop2000Data();
    }, [pathname, currentYear])

    useEffect(() => {
      const isMediaSimplesPage = pathname?.endsWith('/media-simples');
      async function fetchCandidateData() {
        if (!isMediaSimplesPage || !currentYear) return;
        try {
          const res = await fetch(`/api/candidate?year=${currentYear}&rank=${activeRanking}`);
          const json = await res.json();
          setCandidateData(json)
        } catch (err) {
          console.error("Erro ao carregar probtrace:", err);
        } 
      }
      fetchCandidateData();
    }, [pathname, currentYear, activeRanking])

    //---------------------------------------------------------
    //--------------------------MEAN---------------------------
    //---------------------------------------------------------

    const getAreaMap = (codProva: number, tpLingua: number, score: string) => {
      if (!itensData || !score) return [];

      const bits = score.split("");
      const temVersaoDigital = 'TP_VERSAO_DIGITAL' in itensData;

      // 1. Coletar todos os índices válidos para esta prova e língua
      const indicesFiltrados = Object.keys(itensData.CO_PROVA)
        .map(Number)
        .filter((i) => {
          const matchProva = itensData.CO_PROVA[i] === codProva;
          
          // Filtro de Língua (obrigatório para LC, ignorado nas outras se for null)
          const matchLingua = itensData.TP_LINGUA[i] === null || itensData.TP_LINGUA[i] === tpLingua;
          
          let matchDigital = true;
          if (temVersaoDigital && itensData.TP_VERSAO_DIGITAL[i] !== null) {
              matchDigital = itensData.TP_VERSAO_DIGITAL[i] === tpLingua;
          }

          return matchProva && matchLingua && matchDigital;
        });

      // 2. ORDENAÇÃO por posição (essencial para parear com a string do score)
      indicesFiltrados.sort((a, b) => itensData.CO_POSICAO[a] - itensData.CO_POSICAO[b]);

      // 3. VALIDAÇÃO DE INTEGRIDADE
      // Se não encontrar exatamente 45 itens, a estrutura do caderno está errada 
      // e o score não pode ser mapeado com segurança.
      if (indicesFiltrados.length !== 45) {
        console.error(
          `Erro de integridade: Esperados 45 itens, encontrados ${indicesFiltrados.length} para a prova ${codProva}.`
        );
        return []; // Ou throw new Error(...) dependendo da sua preferência
      }

      // 4. MAPEAMENTO FINAL
      return indicesFiltrados.map((i, pointer) => {
        return {
          pos: itensData.CO_POSICAO[i],
          status: itensData.IN_ITEM_ABAN[i] === 1 
            ? "abandoned" 
            : (bits[pointer] === "1" ? "correct" : "wrong"),
          co_item: itensData.CO_ITEM[i]
        };
      });
    };

    //--------------------------------------------------------
    //--------------------------FIM---------------------------
    //--------------------------------------------------------

    if (loading) {
      return null; 
    }
    
    return (
      <NineteenContext.Provider value={{ 
        Inscritos,
        Abstencao_dia1,
        Abstencao_dia2,
        presence_data,
        cor_raca_data,
        sexo_data,
        fx_etaria_data,
        describeRowData, 
        activeSelectedRow,
        abandonadosCodes,
        FIXED_PALETTE,
        d,
        k,
        probData,
        probLabels,
        infoData,
        infoLabels,
        selectedItems,
        lastItemActivate,
        setLastItemActivate,
        lastItemActivateNum,
        setLastItemActivateNum,
        scoreData,
        handleToggle,
        getCodeByLabel,
        getParamByLabel,
        activeCodes,
        acertosData,
        acertosNum,
        setAcertosNum,
        itemGraphData,
        densityDifData,
        describeDifData,
        frequencyDifData,
        competenciaRowData,
        statusData,
        EAPData,
        sampleEAP,
        setSampleEAP,
        setUpdateTrigger,
        updateTrigger,
        intervalData,
        top2000Data,
        activeRanking,
        setActiveRanking,
        candidateData,
        itensData,
        getAreaMap,
        currentYear,
        isDigital
      }}>
        {children}
      </NineteenContext.Provider>
    );
  }

  export const useNineteenData = () => {
    const context = useContext(NineteenContext);
    if (!context) {
      throw new Error("useNineteenData deve ser usado dentro de um NineteenProvider");
    }
    return context;
  };