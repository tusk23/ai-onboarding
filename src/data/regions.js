/* ═══════════════════════════════════════════════════════════════
   DATA — 11 brain regions with AI analogies
   (extraído verbatim de index.html del proyecto Open Design)
   ═══════════════════════════════════════════════════════════════ */
export const REGIONS = [
  { id:'frontal', name:'Corteza Prefrontal',
    brain:'Planificación, toma de decisiones, razonamiento abstracto, control inhibitorio.',
    ai:['Chain-of-Thought','RLHF','Prompt Engineering','Reasoning'],
    analogy:'El CEO del cerebro — siempre preguntando «¿qué pasaría si...?»',
    color:'#FF8C42', center:[0,0.5,0.7], radius:0.5,
    llmRules:[
      'La corteza prefrontal ejecuta razonamiento deliberado paso a paso — en LLMs esto se emula con Chain-of-Thought (CoT) que fuerza al modelo a mostrar su razonamiento antes de concluir.',
      'El control inhibitorio prefrontal equivale a los Safety Guardrails: el modelo debe "reprimir" respuestas peligrosas, sesgadas o erróneas antes de generarlas.',
      'La toma de decisiones con información incompleta se refleja en Few-Shot y Zero-Shot prompting: el modelo debe razonar con ejemplos mínimos o ninguno.',
      'El razonamiento hipotético ("¿qué pasaría si...?") es la base de los Tree-of-Thought y Graph-of-Thought que exploran múltiples caminos de razonamiento simultáneamente.'
    ],
    theory:{
      title:'Atención como Foco Atencional Prefrontal',
      text:'El mecanismo de atención multi-cabeza en Transformers es funcionalmente análogo al foco atencional prefrontal: ambos filtran información relevante de un flujo masivo de entrada. La prefrontal decide A QUÉ prestar atención; el mecanismo de atención decide QUÉ tokens del contexto tienen más peso. El "self-attention" es la versión computacional del "monólogo interno" que la corteza prefrontal usa para auto-monitorizar el propio razonamiento.',
      key:'Temperature (temperatura) es al LLM lo que la dopamina prefrontal es al cerebro: un modulador de cuánta "exploración" vs "explotación" permites en cada decisión.'
    }
  },
  { id:'motor', name:'Corteza Motora / Sensorial',
    brain:'Control del movimiento voluntario, procesamiento sensorial táctil.',
    ai:['Robotics','Action Models','Embodied AI','Control Systems'],
    analogy:'El ejecutor — convierte decisiones en movimiento preciso.',
    color:'#4A90D9', center:[0,0.65,0.1], radius:0.4,
    llmRules:[
      'La corteza motora convierte intención en acción — en IA esto es la capa de "actuación" que toma la decisión del modelo y la ejecuta como una acción concreta (llamar a una API, escribir código, mover un robot).',
      'El homúnculo motor (representación distorsionada del cuerpo) es análogo a los Action Tokens: ciertas acciones reciben más "representación" en el vocabulario del modelo porque son más frecuentes o críticas.',
      'El bucle sensoriomotor (sensar → actuar → sensar de nuevo) es el patrón fundamental de los agentes autónomos: Observar → Pensar → Actuar → Observar (loop de ReAct).',
      'Los modelos de acciones (action models) como GPT-4 con function calling son la corteza motora de la IA: transforman razonamiento abstracto en llamadas ejecutables.'
    ],
    theory:{
      title:'Embodiment y el Problema de la Acción',
      text:'La neurociencia demuestra que el aprendizaje motor requiere retroalimentación corporal (propiocepción). Los LLMs actuales carecen de cuerpo — procesan texto puro. Los modelos multimodales con acción (robotics foundation models) están empezando a cerrar este gap al conectar percepción + razonamiento + ejecución física. El "embodiment" sigue siendo el talón de Aquiles de la IA: saber qué hacer sin poder sentir las consecuencias de hacerlo.',
      key:'El problema "grounding" — que los símbolos de un LLM no están anclados a experiencia sensorial real — es exactamente lo que la corteza motora/sensorial resuelve en humanos: conectar abstracción con sensación.'
    }
  },
  { id:'temporal', name:'Corteza Temporal',
    brain:'Comprensión del lenguaje, memoria semántica, procesamiento auditivo.',
    ai:['NLP','Tokenización','Embeddings','Transformers'],
    analogy:'El traductor universal — convierte señales en significados.',
    color:'#9B59B6', center:[0.65,-0.1,0.15], radius:0.4,
    llmRules:[
      'La corteza temporal izquierda (áreas de Wernicke y Broca) procesa lenguaje comprensivo y productivo — los Transformers replican esto con tokenización + embedding + decodificación generativa.',
      'Los embeddings word2vec/GloVe son la versión computacional del "léxico mental": representaciones vectoriales donde palabras similares están cerca en el espacio, igual que las neuronas semánticas del lobo temporal.',
      'El "context window" de un LLM equivale a la memoria de trabajo auditiva: cuántos tokens anteriores puede el modelo "recordar" simultáneamente al procesar la siguiente palabra.',
      'El procesamiento jerárquico del lenguaje (fonema → palabra → frase → discurso) se replica en las capas del Transformer: capas bajas procesan sintaxis, capas altas procesan semántica y pragmática.'
    ],
    theory:{
      title:'Tokenización como Procesamiento Auditivo',
      text:'El oído humano convierte ondas de sonido en fonemas (~50 categorías) en ~100ms. La tokenización convierte texto en subword tokens (~30k-100k categorías) en microsegundos. Ambos son procesos de "discretización" de un input continuo. La diferencia crítica: los humanos procesan audio en tiempo real secuencial; los Transformers procesan todos los tokens en paralelo (self-attention), lo que les da una comprensión global que el cerebro logra solo con repeticiones y memoria a largo plazo.',
      key:'El "vocabulary" del tokenizer es el equivalente al conjunto de fonemas que un hablante nativo puede discriminar: más vocabulario = más resolución semántica, pero también más coste computacional.'
    }
  },
  { id:'parietal', name:'Corteza Parietal',
    brain:'Integración sensorial, razonamiento espacial, atención.',
    ai:['Multimodal Models','Sensor Fusion','Spatial AI'],
    analogy:'El mezclador maestro — une vista, tacto y espacio en una sola experiencia.',
    color:'#E74C3C', center:[0,0.7,-0.15], radius:0.42,
    llmRules:[
      'La corteza parietal integra múltiples sentidos en una representación unificada — los modelos multimodales (GPT-4V, Gemini, LLaVA) hacen exactamente esto: fusionan texto + imagen + audio en un espacio de representación compartido.',
      'El córtex parietal posterior mapea el "espacio del cuerpo" — los modelos spatial AI (NERF, Gaussian Splatting, SpatialLM) mapean el espacio físico 3D desde datos 2D.',
      'La "atención selectiva parietal" equivale al Cross-Attention en modelos multimodales: un canal de atención que cruza información de un modalidad (imagen) con otra (texto).',
      'El síndrome de negligencia parietal (ignorar la mitad del espacio) tiene un equivalente AI: los modelos sesgados ignoran sistemáticamente ciertas categorías de datos de entrenamiento.'
    ],
    theory:{
      title:'Multimodalidad como Integración Parietal',
      text:'El cerebro humano es fundamentalmente multimodal — nunca procesa un solo sentido de forma aislada. Los LLMs de texto puro son "unimodales" como un paciente con destrucción bilateral del parietal: pueden procesar un canal, pero no cruzar información entre sentidos. Los modelos que fusionan texto + imagen + código + audio están reconstruyendo la capacidad parietal que el procesamiento unidimensional perdió.',
      key:'La "unified embedding space" de modelos como CLIP es el equivalente al córtex parietal superior: un espacio donde imagen y texto viven juntos y se puede navegar de uno a otro.'
    }
  },
  { id:'occipital', name:'Corteza Occipital',
    brain:'Procesamiento visual, reconocimiento de patrones, percepción de color.',
    ai:['Computer Vision','Diffusion Models','CNNs','YOLO'],
    analogy:'El cineasta interno — construye mundos visuales enteros desde photons.',
    color:'#F1C40F', center:[0,0.25,-0.8], radius:0.38,
    llmRules:[
      'La corteza visual procesa en jerarquía (V1→V2→V4→IT): bordes → texturas → formas → objetos. Las CNNs replican esta arquitectura exacta: capas tempranas detectan bordes, capas profundas detectan conceptos.',
      'La difusión de imagen (Stable Diffusion, DALL-E, Midjourney) funciona como la corteza visual inversa: en lugar de deconstruir una imagen en features, construye una imagen desde ruido añadiendo estructura progresivamente.',
      'El campo receptive de cada neurona visual equivale al kernel de una CNN: ambos examinan una región local y propagan información hacia arriba en la jerarquía.',
      'YOLO (You Only Look Once) emula la速 rapidez de la vía visual dorsal ("vía del dónde"): procesa toda la escena en una pasada para localizar objetos, igual que el cerebro detecta amenazas en <200ms.'
    ],
    theory:{
      title:'De CNNs a Vision Transformers',
      text:'Las CNNs copiaron la arquitectura visual del cortex (receptive fields locales, pooling jerárquico). Los Vision Transformers (ViT) desafiaron esto al procesar imágenes como secuencias de patches, ignorando la estructura local. Sorprendentemente, ViT supera a CNNs en datos suficientes — sugiriendo que el cerebro visual humano puede no ser la única arquitectura óptima para procesamiento visual. Pero en datos limitados, CNNs siguen ganando, igual que el cerebro humano supera a la IA en reconocimiento con pocos ejemplos.',
      key:'La "atención visual" (cortical magnification) — donde la fóvea tiene más resolución que la periferia — es análogo al "patch importance" en ViT: no todos los patches de una imagen merecen la misma atención computacional.'
    }
  },
  { id:'hipocampo', name:'Hipocampo',
    brain:'Formación de memoria declarativa, navegación espacial.',
    ai:['RAG','Vector Databases','Context Windows','Memory Systems'],
    analogy:'El archivista — decide qué guardar para siempre y qué dejar ir.',
    color:'#8E44AD', center:[0.18,-0.22,0.12], radius:0.3,
    llmRules:[
      'El hipocampo consolida memoria a largo plazo desde memoria de trabajo — los LLMs no tienen memoria persistente entre conversaciones. RAG y las vector databases son la capa de "consolidación" que permite al modelo acceder a conocimiento externo.',
      'Las células de lugar (place cells) del hipocampo crean mapas espaciales — los embeddings vectoriales crean mapas semánticos donde la "distancia" refleja similitud conceptual, no física.',
      'El "context window" es la memoria de trabajo del LLM (equivalente al hipocampo dorsal en roedores). Lo que entra en contexto se puede "recordar" para esa sesión; lo que sale se pierde.',
      'La consolidación de memoria durante el sueño (replay de experiencias) equivale al fine-tuning y el retrieval-augmented generation: el modelo "re-examina" información almacenada para fortalecer sus conexiones.'
    ],
    theory:{
      title:'Memoria sin Hipocampo — El Problema Fundamental de los LLMs',
      text:'El hipocampo humano almacena ~2.5 petabytes de información a lo largo de una vida. Los LLMs almacenan su "conocimiento" en los pesos del modelo (memoria procedural, no declarativa) y en el contexto (memoria de trabajo). No hay equivalente al hipocampo: no pueden formar nuevos recuerdos declarativos durante inferencia. RAG, fine-tuning, y vector stores son parches parciales a esta carencia fundamental. Un sistema con memoria verdadera como la del hipocampo sería capaz de aprender de una conversación sin re-entrenamiento.',
      key:'El "forgetting" en LLMs (context window finito) es como la amnesia anterógrada: no puedes formar nuevos recuerdos de lo que acaba de pasar si la información sale del contexto activo.'
    }
  },
  { id:'amigdala', name:'Amígdala',
    brain:'Procesamiento emocional, respuesta de miedo, aprendizaje afectivo.',
    ai:['Sentiment Analysis','Emotion AI','Safety Filters','Guardrails'],
    analogy:'El guardián emocional — detecta el peligro antes que la razón.',
    color:'#E91E63', center:[0.22,-0.12,0.38], radius:0.22,
    llmRules:[
      'La amígdala detecta amenazas antes de que la corteza prefrontal procese racionalmente — los safety classifiers en LLMs actúan igual: filtran contenido peligroso ANTES de que el modelo genere una respuesta completa.',
      'El sesgo negativo humano (la amígdala reacciona más fuerte a lo negativo) tiene un equivalente en RLHF: los humanos anotadores tienden a penalizar más las respuestas dañinas que a premiar las beneficiosas, creando un sesgo de conservadurismo.',
      'El "temperamento emocional" (amígdala hiperactiva = ansiedad) equivale a un modelo con safety filters demasiado agresivos: rechaza demasiadas peticiones inocentes por miedo a generar algo dañino.',
      'La recompensa y castigo que modula la amígdala es la base de RLHF y Constitutional AI: el modelo aprende a evitar respuestas "peligrosas" por refuerzo negativo.'
    ],
    theory:{
      title:'El dilema Safety-Capability',
      text:'La amígdala dañada produce síndrome de Kluver-Bucy: el paciente pierde el miedo y la inhibición social. Los LLMs sin safety filters son equivalentes: capaces de generar cualquier cosa, incluyendo contenido dañino, sesgado, o peligroso. Pero una amígdala hiperactiva produce ansiedad paralizante — un modelo con filtros excesivos se vuelve inútil. El equilibrio amígdala-prefrontal es el mismo que el equilibrio safety-capability en IA: suficiente restricción para ser seguro, suficiente libertad para ser útil.',
      key:'Constitutional AI (Anthropic) es el equivalente a una corteza prefrontal que "enseña" a la amígdala qué amenazas son reales vs. falsas positivas — reduce la hipersensibilidad del safety system.'
    }
  },
  { id:'talamo', name:'Tálamo',
    brain:'Relay central de información sensorial, regulación de la conciencia.',
    ai:['API Gateway','Message Broker','Data Pipeline','Router'],
    analogy:'El director de tráfico — todo dato sensorial pasa por aquí.',
    color:'#2ECC71', center:[0.12,0.0,0.0], radius:0.35,
    llmRules:[
      'El tálamo filtra y redirige toda la información sensorial antes de que llegue a la corteza — los API Gateways y Load Balancers hacen lo mismo: receives TODA la demanda, la filtra, la balancea, y la dirige al servicio correcto.',
      'El "núcleo reticular" del tálamo (gatekeeper que decide qué información pasa) equivale al content filtering en un LLM gateway: decide qué peticiones llegan al modelo y cuáles se rechazan antes del procesamiento.',
      'La regulación de la conciencia talámica se refleja en los "model routers": cuando una petición puede ser atendida por múltiples modelos (GPT-4 vs GPT-3.5, grande vs pequeño), el router determina qué "consciencia" (modelo) recibe la carga.',
      'Los loops talamo-corticales (tálamo → corteza → tálamo) son análogos a los retry loops en sistemas distribuidos: si la respuesta no es satisfactoria, la petición regresa al gateway para reintentarse.'
    ],
    theory:{
      title:'Infraestructura como Sistema Talámico',
      text:'El tálamo consume ~0.15% del peso cerebral pero maneja ~98% de la información sensorial (excepto olfato). Los API gateways son proporcionalmente similares: componentes "pequeños" que son puntos únicos de fallo para todo el sistema. Un tálamo dañado produce coma — un API gateway caído tumbará todos los servicios. La redundancia en infraestructura (multi-AZ, failover) es la respuesta de ingeniería al problema que la evolución resolvió con un tálamo bilateral (dos hemisferios, dos tálamos).',
      key:'El "context routing" en arquitecturas LLM (determinar si una query va a RAG, fine-tuned model, o search) es funcionalmente un sistema talámico: clasificar y dirigir información al módulo procesador correcto.'
    }
  },
  { id:'cuerpo_calloso', name:'Cuerpo Calloso',
    brain:'Comunicación entre hemisferios cerebrales, transferencia de información.',
    ai:['Ensemble Methods','Multi-Agent Systems','Mixture of Experts'],
    analogy:'El puente — conecta dos mundos que no saben que existen el uno sin el otro.',
    color:'#95A5A6', center:[0.1,0.32,0.0], radius:0.35,
    llmRules:[
      'El cuerpo calloso integra procesamiento de ambos hemisferios en una conciencia unificada — los Mixture of Experts (MoE) integran múltiples "modelos expertos" en una única respuesta coherente.',
      'Los ~200 millones de fibras del cuerpo calloso transmiten información entre hemisferios — los "gating networks" en MoE determinan qué expertos reciben información y cuánta, actuando como un sistema de comunicación selectiva.',
      'El hemisferio izquierdo (lógico-verbal) y derecho (espacial-emocional) son análogos a un sistema multi-agente donde un agente "analítico" y otro "creativo" colaborean — el cuerpo calloso es el canal de comunicación entre ambos.',
      'Split-brain experiments (Gazzaniga) muestran qué pasa SIN el cuerpo calloso: dos "conciencias" separadas — equivalente a un sistema multi-agente sin protocolo de comunicación coordinado.'
    ],
    theory:{
      title:'Coordinación Multi-Agente como Integración Hemisférica',
      text:'Un cerebro humano funciona porque 86 mil millones de neuronas coordinan comunicación en tiempo real. Los sistemas multi-agente actuales (AutoGPT, CrewAI, LangGraph) intentan coordinar múltiples LLMs especializados. El cuerpo calloso resuelve esto en el cerebro con baja latencia (<1ms). Los agentes artificiales enfrentan latencias de red, formatos inconsistentes, y ausencia de un "protocolo calloso" estándar. La brecha de coordinación es la razón por la que un solo LLM grande frecuentemente supera a un equipo de LLMs pequeños.',
      key:'El "speculative decoding" (un modelo pequeño predice, uno grande verifica) es una versión simplificada de la dinámica hemisférica: el hemisferio dominante propone, el no-dominante verifica.'
    }
  },
  { id:'cerebelo', name:'Cerebelo',
    brain:'Control motor fino, coordinación, aprendizaje procedural.',
    ai:['Fine-tuning','Optimization','Gradient Descent','LoRA','QLoRA'],
    analogy:'El artesano — perfecciona cada movimiento con práctica.',
    color:'#D4A574', center:[0.15,-0.55,-0.5], radius:0.45,
    llmRules:[
      'El cerebelo contiene más neuronas que el resto del cerebro combinado, pero solo "ejecuta" — no decide. El fine-tuning es lo mismo: no cambia lo que el modelo sabe (pre-training), sino CÓMO lo ejecuta (precisión, estilo, formato).',
      'El aprendizaje cerebelar es procedural (aprender a andar en bicicleta) — el fine-tuning de LLMs es equivalente: ajusta patrones procedimentales (cómo responder, qué tono usar) sin alterar el conocimiento factual subyacente.',
      'Gradient Descent es el "error signal" cerebelar: el cerebelo compara la intención motora con el resultado real y ajusta; Gradient Descent compara la predicción con el objetivo y ajusta pesos.',
      'LoRA/QLoRA son la especialización cerebelar: en lugar de re-entrenar todo el cerebro (full fine-tuning), solo ajustas un subconjunto de conexiones para una tarea específica, como el cerebelo especializa movimientos específicos.'
    ],
    theory:{
      title:'El Coste del Fine-Tuning como Coordinación Motora',
      text:'El cerebelo humano necesita ~10,000 horas de práctica para dominar una habilidad motora. El fine-tuning de un LLM grande necesita miles de ejemplos y cientos de GPU-horas. Ambos son procesos de "compresión" — tomar un repertorio general y especializarlo para una tarea concreta. El descubrimiento de LoRA (2021) fue equivalente a descubrir que solo necesitas entrenar el cerebelo, no toda la corteza: redujo el coste de fine-tuning en 10-100x sin perder calidad.',
      key:'El "learning rate" en gradient descent es el equivalente al tono muscular: demasiado alto = temblores (divergencia), demasiado bajo = movimiento lento e impreciso (convergencia lenta). El cerebelo ajusta esto constantemente con retroalimentación sensorial.'
    }
  },
  { id:'tronco', name:'Tronco Encefálico',
    brain:'Funciones vitales automáticas: respiración, ritmo cardíaco, sueño.',
    ai:['MLOps','Infrastructure','Kubernetes','Model Serving'],
    analogy:'Los cimientos — funciona perfectamente sin que nunca lo notes.',
    color:'#A0522D', center:[0.08,-0.78,-0.08], radius:0.2,
    llmRules:[
      'El tronco encefálico mantiene las funciones vitales sin conciencia — MLOps mantiene los modelos vivos sin que el usuario lo note: health checks, auto-scaling, failover, logging.',
      'Si el tronco encefálico falla, el cuerpo muere instantáneamente — si la infraestructura base falla (GPU cluster down, network partition), todos los modelos dejan de funcionar.',
      'El ciclo sueño-vigilia (tronco encefálico) equivale a los ciclos de deployment: el modelo necesita "downtime" para actualizarse (rolling updates, blue-green deployment) igual que el cerebro necesita sueño para consolidar memoria.',
      'Los núcleos del tronco (cardíaco, respiratorio) son autónomos — los microservicios base (logging, monitoring, secrets management) son igualmente autónomos y deben funcionar sin intervención humana.'
    ],
    theory:{
      title:'Infraestructura Invisible como Función Vital',
      text:'Los ingenieros de infraestructura son los "neurocientíficos del tronco encefálico": su trabajo es invisible cuando funciona y catastrófico cuando falla. Un tronco encefálico sano es indetectable — una infraestructura sana es indetectable. La paradoja del éxito en MLOps es que el mejor sistema es el que nadie menciona. Los SLA (Service Level Agreements) son los "signos vitales" de la infraestructura: latencia = frecuencia cardíaca, throughput = saturación de oxígeno, error rate = presión arterial.',
      key:'Kubernetes es al MLOps lo que el sistema nervioso autónomo es al cuerpo: regula todo automáticamente sin que "tú" (el usuario/application) tengas que pensar en ello. Pero cuando algo sale mal, la "enfermedad" es silenciosa hasta que es crítica.'
    }
  }
];
