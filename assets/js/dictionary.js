/**
 * dictionary.js — Banco de palavras em português organizado por categorias
 * Cada categoria contém dezenas/centenas de palavras sem acentuação
 * (caça-palavras tradicionais usam letras sem acento)
 * Todas as palavras são minúsculas e sem caracteres especiais.
 */

const Dictionary = (() => {
    'use strict';

    const WORDS = {
        animais: [
            'cachorro','gato','elefante','leao','tigre','urso','lobo','raposa','veado','coelho',
            'esquilo','hamister','porco','boi','vaca','cavalo','cabrito','ovelha','cabra','burro',
            'mulo','antílope','zebra','girafa','camelo','dromedario','alpaca','lhama','búfalo','jumento',
            'macaco','gorila','chimpanze','orangotango','babuíno','mandril','gibão','mico','sagui','búlgaro',
            'papagaio','periquito','calopsita','canario','agapornis','diamante','mandarim','caturrita','maritaca','arara',
            'tucano','pica-pau','beija-flor','colibri','sabiá','sanhaçu','bem-te-vi','coruja','águia','falcão',
            'gavião','urubu','condor','garça','cegonha','flamingo','pelicano','gaivota','martim-pescador','pato',
            'ganso','cisne','marreco','ema','avestruz','pinguim','galinha','galō','peru','pomba',
            'rolinha','beija-flor','andorinha','andrajo','corvo','gralha','pavão','faisão','codorna','jaçanã',
            'peixe','tubarao','arraia','sardinha','atum','salmao','truta','carpa','dourado','pirarucu',
            'tambaqui','piranha','pacu','surubim','dourado','tilapia','bacalhau','merluza','cação','polvo',
            'lula','camarao','caranguejo','lagosta','ostra','mexilhao','vieira','equina','abalone','caracol',
            'lesma','cobra','jibóia','sucuri','jararaca','cascavel','coral','naja','píton','cobra-cipó',
            'iguana','calango','lagartixa','camaleao','jabuti','tartaruga','cágado','crocodilo','jacare','caimao',
            'sapo','ra','perereca','salamandra','tritao','cobrar','mamba','surucucu','boipeva','jiboia',
            'baleia','golfinho','orca','foca','morsa','leao-marinho','peixe-boi','lontra','castor','ratão',
            'ouriço','doninha','furao','texugo','ariranha','cachorro-do-mato','loboguara','guariba','bugio','sauva',
            'tamandua','preguiça','tatu','quati','cutia','paca','capivara','antílope','gato-maracaja','onca',
            'onça-pintada','onca-parda','suçuarana','jaguarundi','lobinho','irara','furao','gato-mourisco','cachorro-vinagre','raposinha',
            'morcego','morcego-vampiro','morcego-fruteiro','morcego-pescador','tapir','anta','veado-campeiro','veado-mateiro','cervo','corça',
            'faisao','pavão','cacatua','ecletus','kakapo','kefios','bem-ti-vi','anú','seriema','siriema'
        ],

        paises: [
            'brasil','argentina','chile','uruguai','paraguai','bolivia','peru','colombia','venezuela','equador',
            'guiana','suriname','mexico','cuba','jamaica','haiti','república dominicana','bahamas','barbados','trinidad',
            'portugal','espanha','franca','italia','alemanha','holanda','belgica','suiça','austria','inglaterra',
            'escocia','irlanda','gales','dinamarca','suecia','noruega','finlandia','islandia','polonia','tchéquia',
            'russia','ucrania','romenia','bulgaria','hungria','servia','croacia','eslovenia','eslováquia','lituania',
            'letonia','estonia','grecia','turquia','israel','egito','marrocos','argelia','tunisia','libia',
            'nigeria','africadosul','quenia','etiopia','ghana','senegal','camaroes','angola','mozambique','zimbábue',
            'japao','china','india','coreia','vietnam','tailândia','indonesia','filipinas','malasia','singapura',
            'camboja','myanmar','nepal','paquistao','bangladesh','sirilanka','afeganistao','irã','iraque','arabiasaudita',
            'emirados','catar','kuwait','jordania','libano','siria','iemen','omã','australia','novazelândia',
            'canada','estadounidos','estadosunidos','estadosunidos','canadá','méxico','estados','unidos'
        ],

        estados: [
            'sao-paulo','rio-janeiro','minas','bahia','parana','santa-catarina','rio-grande','goias','espirito','distrito',
            'mato-grosso','amazonas','para','maranhao','ceara','pernambuco','rio-grande-do-sul','bahia','pará','tocantins',
            'piauí','paraiba','rio-grande-do-norte','alagoas','sergipe','acre','rondonia','amapa','roraima','matogrosso',
            'matogrossodosul','sao-paulo','riodejaneiro','minasgerais','espiritosanto','santacatarina','parana','riograndedosul'
        ],

        cidades: [
            'sao-paulo','rio-de-janeiro','salvador','brasilia','fortaleza','curitiba','belo-horizonte','manaus','recife','porto-alegre',
            'belém','goiania','guarulhos','campinas','sao-luis','maceió','duque-de-caxias','são-gonçalo','natal','teresina',
            'sao-bernardo','campo-grande','osasco','santo-andre','joão-pessoa','jaboatão','contagem','sao-jose','ribeirao','uberlandia',
            'sorocaba','aracaju','feira-de-santana','cuiaba','joinville','franca','londrina','juiz-de-fora','niteroi','ananindeua',
            'belford-roxo','municipio','timon','mossoro','osasco','sao-carlos','petropolis','canoas','mogi-guaçu','santos',
            'vila-velha','florianopolis','maua','vitoria','campos','diadema','guarapari','betim','carapicuiba','itapevi'
        ],

        frutas: [
            'banana','maca','laranja','limao','uva','pera','mamao','melao','melancia','abacaxi',
            'manga','goiaba','maracuja','acerola','caja','caju','coco','ameixa','amora','framboesa',
            'mirtilo','morango','pessego','abrico','cereja','figo','roma','damasco','nectarina','kiwi',
            'abacate','carambola','cupuaçu','graviola','jenipapo','mangaba','sapoti','seriguela','umbu','caqui',
            'lichia','tamara','jasmin','physalis','pitaia','noni','romã','tamarindo','jabuticaba','pitanga',
            'guaraná','açaí','bacuri','buriti','pequi','baru','macaúba','coco-babo','fresinha','inhame'
        ],

        legumes: [
            'batata','cenoura','beterraba','cebola','alho','nabo','rabanete','chuchu','abobora','abobrinha',
            'pepino','pimento','pimentao','berinjela','quiabo','maxixe','inhame','cará','mandioca','batata-doce',
            'ervilha','feijao','lentilha','grao-de-bico','soja','milho','milho-verde','vagem','fava','tremoco',
            'gengibre','curcuma','raiz-forte','salsao','salsão','funcho','alho-poró','cebolinha','cebolim','cebolete',
            'nirá','mandioquinha','batata-yacon','batata-baroa','batata- salsa','taro','gengibre','nirá-manso','brotos','broto'
        ],

        verduras: [
            'alface','rucula','espinafre','acelga','repolho','couve','couve-flor','brocolis','repolho','agriao',
            'chicoria','radiche','endivia','escarola','mostarda','taioba','bertalha','capucho','espinafre','mostarda',
            'coentro','salsinha','cebolinha','manjericão','hortela','alecrim','tomilho','sálvia','louro','orégano',
            'erva-doce','erva-cidreira','erva-de-santa-maria','ervilha-torta','mostarda','couve-de-bruxelas','couve-rábano','couve-galega','couve-portuguesa','couve-folha'
        ],

        profissoes: [
            'medico','enfermeiro','dentista','advogado','professor','engenheiro','arquiteto','contador','administrador','veterinario',
            'farmaceutico','fisioterapeuta','psicologo','psiquiatra','cirurgiao','clinico','pediatra','ginecologista','cardiologista','neurologista',
            'ortopedista','oftalmologista','otorrino','dermatologista','radiologista','anestesista','obstetra','geriatra','hematologista','endocrinologista',
            'enfermeira','tecnico','auxiliar','fisioterapeuta','fonoaudiologo','terapeuta','nutricionista','educador','pedagogo','psicopedagogo',
            'motorista','piloto','comandante','marinheiro','capitao','comandante','maquinista','maquinaria','mecanico','eletricista',
            'encanador','pedreiro','pintor','carpinteiro','soldador','serralheiro','funileiro','vidraceiro','gesseiro','azulejista',
            'marceneiro','estofador','costureira','alfaiate','sapateiro','cabeleireiro','barbeiro','manicure','esteticista','maquiadora',
            'jornalista','repórter','fotógrafo','cinegrafista','editor','redator','roteirista','diretor','produtor','animador',
            'atleta','jogador','treinador','árbitro','musico','cantor','compositor','dançarino','ator','atriz',
            'escritor','romancista','poeta','dramaturgo','cronista','ilustrador','pintor','escultor','cartunista','designer',
            'programador','desenvolvedor','analista','designer','webmaster','administrador','suporte','tester','devops','datascience'
        ],

        esportes: [
            'futebol','voleibol','basquete','handebol','tenis','natacao','atletismo','ginastica','boxe','judô',
            'karate','taekwondo','esgrima','ciclismo','corrida','maratona','saltos','arremesso','lançamento','marcha',
            'remo','vela','surf','skate','snowboard','esqui','patinacao','hockey','golfe','rugby',
            'cricket','basebol','futebol-americano','futsal','futevôlei','peteca','bocha','sinuca','bilhar','dardos',
            'badminton','squash','raquetebol','tênis-de-mesa','frescobol','caiaque','canotagem','rafting','escalada','alpinismo',
            'paraquedismo','asa-delta','parapente','mergulho','pesca','caca','tiro','arco-e-flecha','hipismo','polo',
            'corrida','automobilismo','motociclismo','rally','kart','ciclismo','mountain-bike','bmx','speedway','formula'
        ],

        tecnologia: [
            'computador','notebook','servidor','processador','memoria','placa-mãe','hd','ssd','monitor','teclado',
            'mouse','impressora','scanner','roteador','modem','switch','hub','firewall','antivirus','backup',
            'nuvem','virtualizacao','container','docker','kubernetes','ci-cd','pipeline','deploy','monitoramento','log',
            'algoritmo','database','servidor','frontend','backend','fullstack','framework','biblioteca','api','rest',
            'graphql','websocket','microservico','arquitetura','design-pattern','agile','scrum','kanban','devops','git',
            'repositorio','branch','commit','merge','pull-request','code-review','refactoring','debug','profilin','testing',
            'unit-test','integration','e2e','mock','stub','spy','fixture','coverage','linting','formatter',
            'compilador','interpretador','linker','assembler','bytecode','runtime','garbage','threads','concorrencia','paralelismo'
        ],

        ciencia: [
            'atomo','molecula','celula','dna','rna','proteina','enzima','genética','evolucao','mutacao',
            'fotossintese','respiracao','mitose','meiose','cromossomo','gene','alelo','genotipo','fenotipo','hereditariedade',
            'fisica','quimica','biologia','matematica','astronomia','geologia','meteorologia','oceanografia','ecologia','botanica',
            'zoologia','anatomia','fisiologia','embriologia','histologia','citologia','microbiologia','bacteriologia','virologia','micologia',
            'parasitologia','imunologia','neurociencia','etologia','taxonomia','sistematica','paleontologia','bioquímica','biofisica','biotecnologia',
            'eletricidade','magnetismo','optica','acustica','termodinamica','mecanica','relatividade','quantica','gravidade','inércia',
            'velocidade','aceleracao','forca','energia','trabalho','potencia','pressao','temperatura','calor','entropia',
            'acido','base','ph','oxidacao','reducao','catalisador','reacao','composto','elemento','tabela-periodica',
            'atomo','eletron','proton','neutron','nucleo','orbital','isótopo','ion','molécula','ligacao'
        ],

        historia: [
            'egipto','rome','grecia','mesopotamia','persia','china-india','incas','maias','astecas','olmecas',
            'fenicios','hebreus','sumerios','babilônia','assiria','cartago','macedonia','imperio-romano','bizantino','ottomano',
            'renascimento','iluminismo','revolucao-industrial','revolucao-francesa','descobrimento','colonizacao','independencia','abolicao','republica','democracia',
            'monarquia','imperio','feudalismo','escravidao','cruzadas','inquisicao','reforma','contrarreforma','santainquisicao','guerra-fria',
            'primeira-guerra','segunda-guerra','guerra-civil','revolucao','guerra-do-vietna','guerra-da-coreia','muro-de-berlim','queda-da-bastilha','descobrimento-do-brasil','proclamacao-da-republica',
            'faraó','piramide','esfinge','mumia','hieroglifo','papiro','coliseu','partenon','acrepole','forum',
            'senado','consul','imperator','tribuno','plebeu','patricio','plebe','nobreza','clero','burguesia',
            'cruzado','templario','cavaleiro','feudo','vassalo','suserano','servo','comuna','corporacao','guilda',
            'navegador','conquistador','colonizador','missionário','bandeirante','paulista','senhor-de-engenho','escravo','indio','negro'
        ],

        corpoHumano: [
            'cabeca','rosto','cabelo','testa','sobrancelha','cilios','olho','nariz','boca','labio',
            'dente','lingua','queixo','maxilar','mandibula','orelha','pescoco','garganta','esófago','traqueia',
            'ombro','braco','cotovelo','antebraco','pulso','mao','palma','dedo','polegar','indicador',
            'medio','anelar','minimo','unha','peito','torax','costela','coracao','pulmao','figado',
            'estomago','intestino','rim','bexiga','pancreas','figado','vesicula','apendice','abdomen','umbigo',
            'quadril','pelve','coxa','joelho','panturrilha','canela','tornozelo','pe','calcanhar','sola',
            'arco','dedo-do-pe','coluna','vertebra','medula','osso','musculo','tendon','ligamento','cartilagem',
            'pele','epiderme','derme','hipoderme','glândula','suor','poro','cabelo','folículo','unha',
            'arteria','veia','capilar','sangue','plasma','globulo','plaqueta','linfócito','anticorpo','vacina',
            'cerebro','cerebelo','tronco','nervo','neuronio','sinapse','hipotálamo','pituitária','tireoide','adrenal'
        ],

        natureza: [
            'arvore','floresta','rio','lago','mar','oceano','montanha','colina','vale','deserto',
            'praia','duna','ilha','arquipelago','peninsula','istmo','baia','enseada','fiorde','golfão',
            'vulcao','caverna','gruta','cachoeira','nascente','poço','lagoa','represa','açude','brejo',
            'pantanal','mangue',' restinga','caatinga','cerrado','pampa','amazonia','mata-atlantica','floresta-tropical','savana',
            'tundra','taiga','estepes','pradaria','savana','deserto','oasis','duna','erg','hamada',
            'nuvem','chuva','tempestade','trovoada','relampago','trovao','granizo','neve','geada','orvalho',
            'vento','brisa','furacao','tornado','ciclone','tifao','moncao','seca','enchente','inundação',
            'terra','rocha','pedra','areia','argila','silte','humus','solo','subsolo','mineral',
            'planta','flor','folha','caule','raiz','semente','fruto','espora','polen','nectar'
        ],

        matematica: [
            'soma','subtracao','multiplicacao','divisao','equacao','fração','decimal','porcentagem','raiz','potencia',
            'logaritmo','fatorial','trigonometria','geometria','algebra','calculo','estatistica','probabilidade','combinatoria','teoria-dos-numeros',
            'angulo','triangulo','quadrado','retangulo','circulo','esfera','cubo','piramide','cilindro','cone',
            'paralelogramo','trapézio','losango','pentagono','hexagono','heptagono','octogono','decagono','dodecagono','icosa-gono',
            'ponto','reta','plano','segmento','raio','diametro','circunferencia','perimetro','area','volume',
            'teorema','axioma','postulado','lema','corolario','proposicao','demonstracao','hipotese','tese','conclusao',
            'paralelo','perpendicular','mediana','bissetriz','altura','base','cateto','hipotenusa','apótema','diagonal',
            'primo','composto','par','impar','multiplo','divisor','mdc','mmc','fator','múltiplo',
            'conjunto','elemento','subconjunto','união','intersecao','diferenca','complementar','particao','relacao','funcao'
        ],

        portugues: [
            'substantivo','adjetivo','verbo','adverbio','pronome','preposicao','conjuncao','interjeicao','artigo','numeral',
            'sujeito','predicado','objeto','complemento','adjunto','aposto','vocativo','predicativo','agente','paciente',
            'oração','frase','periodo','paragrafo','texto','ditongo','tritongo','hiato','silaba','tonica',
            'acento','crase','til','cedilha','apóstrofo','hifen','ponto','virgula','ponto-virgula','dois-pontos',
            'sílaba','paroxítona','proparoxítona','oxítona','monotongacao','ditongacao','nasalizacao','sonorizacao','palatalizacao','assimilacao',
            'síncope','apócope','sínérese','diérese','metaplasmo','anaptixe','epêntese','paragoge','sínalefa','elisao',
            'metáfora','metonímia','sínédoque','catacrese','antonímia','sinonímia','hiperonimia','hiponimia','polissemia','homonímia',
            'parônimo','homófono','homógrafo','parônimo','anagrama','palíndromo','acrônimo','sigla','abreviatura','onomatopeia',
            'narrativa','descritiva','dissertativa','argumentativa','expositiva','injuntiva','dialogada','epistolar','poética','dramática'
        ],

        objetos: [
            'mesa','cadeira','sofa','cama','armario','estante','mesa','escrivaninha','criado-mudo','cômoda',
            'guarda-roupa','cabideiro','colchão','travesseiro','lençol','cobertor','edredom','almofada','manta','tapete',
            'cortina','persiana','abajur','lustre','lampada','vela','castiçal','candeeiro','lanterna','lanterna',
            'prato','copo','xicara','caneca','garfo','faca','colher','espatula','concha','pegador',
            'panela','frigideira','caldeirão','assadeira','forma','travessa','bowl','tigela','pires','saladeira',
            'jarra','jarrão','cuscuzeiro','peneira','ralador','batedor','espremedor','funil','alça','pegador',
            'tesoura','faca','estilete','martelo','chave-de-fenda','alicante','pincel','broxa','rolo','desem-paxadora',
            'escova','pente','secador','chapinha','ferro-de-passar','aspirador','vassoura','rodo','pá','pano',
            'balde','bacia','tonel','caixa','baú','arcão','arcão','malote','mochila','bolsa'
        ],

        veiculos: [
            'carro','moto','bicicleta','caminhao','onibus','van','trator','bicicleta','triciclo','quadriciclo',
            'caminhonete','pick-up','perua','station-wagon','hatch','sedan','suv','cupê','conversível','minivan',
            'motocicleta','scooter','motoneta','tricycle','sidecar','trailer','carreta','reboque','semi-reboque','cavalo-mecânico',
            'ônibus','microonibus','lotacao','carroça','charrete','carruagem','diligencia','treno','triciclo','rickshaw',
            'metrô','trem','locomotiva','vagao','bonde','tram','monotrilho','maglev','funicular','teleférico',
            'aviao','helicoptero','balão','dirigível','planador','ultraleve','hotliner','parapente','asa-delta','drone',
            'barco','navio','iate','canoa','caiaque','jangada','balsa','veleiro','catamarã','hovercraft',
            'submarino','mersão','bati-scafo','lancha','barco-a-motor','rebocador','cargueiro','petroleiro','portamalotes','cruseiro'
        ],

        astronomia: [
            'planeta','estrela','galaxia','nebulosa','buraco-negro','asteroide','cometa','meteoro','meteorito','satélite',
            'sol','lua','mercurio','venus','marte','jupiter','saturno','urano','netuno','plutao',
            'andromeda','via-lactea','magalhães','via-láctea','constelação','orion','ursa-maior','ursa-menor','cruzeiro-do-sul','escorpiao',
            'cassiopeia','sirius','vega','altair','deneb','polaris','antares','rigel','betelgeuse','aldebarã',
            'telescopio','observatório','planeta-ano','planeta-nano','exoplaneta','asteroide-belt','kuiper','oort','astronauta','cosmonauta',
            'orbita','apogeu','perigeu','eclipse','solsticio','equinocio','zodiac','meridiano','paralelo','latitude',
            'longitude','hemisferio','equador','tropico','polo','aurora','boreal','austral','zodiac','cinturão'
        ],

        mitologia: [
            'zeus','hera','poseidon','apolo','artemis','atena','hermes','ares','afrodite','hefesto',
            'dioniso','demeter','hestia','hades','perséfone','eros','pan','ninfas','quiron','caronte',
            'minotauro','medusa','hidra','quimera','cerbero','pegaso','centauro','sátiro','sereia','gorgona',
            'titans','cyclops','hecantochires','gigantes','hécate','nêmesis','morpheus','thanatos','hypnos','charon',
            'odin','thor','loki','freya','freyr','balder','tyr','heimdall','frigga','sif',
            'valhalla','asgard','midgard','jotunheim','niflheim','muspelheim','vanaheim','alfheim','svartalfheim','hel',
            'fenrir','jormungand','sleipnir','gungnir','mjolnir','draupnir','megingjord','andvaranaut','brisingamen','gjallarhorn',
            'ra','isis','osiris','horus','anubis','thoth','set','bastet','ptah',' Hathor',
            'seth','nephthys','nut','geb','shu','tefnut','atum','amun','aten','khonsu'
        ],

        filmes: [
            'estrelas','galaxia','tempestade','horizonte','infinito','descoberta','aventura','misterio','lendaris','coragem',
            'destino','legendas',' jornada','redencao','tesouro','batalha','império','reino','frente','guerreiro',
            'sombra','eternidade','fantasia','epico','poderoso','lendario','destemido','vitoria','conquista','triumfo',
            'esperanca','revolta','liberdade','vanguarda','ultimato','despertar','ascensao','profecia','alianca','pacto',
            'fortaleza','bastilha','reduto','bunker','forte','castelo','palacio','torre','fortaleza','muralha',
            'tempestade','furacao','tornado','vulcao','terremoto','tsunami','avalanche','desabamento','erosao','diluvio',
            'roboto','maquina','computador','chip','circuito','programa','algoritmo','inteligencia','artificial','neural',
            'planeta','estrela','cometa','meteor','galaxia','nebulosa','universo','cosmos','buraco','estelar',
            'dinossauro','fossil','extincao','predador','presa','caca','selva','floresta','deserto','tundra'
        ],

        culinaria: [
            'arroz','feijao','macarrao','carne','frango','peixe','ovo','queijo','presunto','bacon',
            'salsicha','linguiça','mortadela','salame','pepperoni','salpicao','pato','peru','chester','codorna',
            'alface','tomate','cebola','alho','cenoura','batata','beterraba','pepino','pimentao','abobora',
            'abobrinha','berinjela','chuchu','quiabo','maxixe','ervilha','vagem','milho','lentilha','grao-de-bico',
            'sal','acucar','azeite','oleo','vinagre','molho','ketchup','maionese','mostarda','barbecue',
            'pimenta','colorau','páprica','cúrcuma','cravo','canela','noz-moscada','gengibre','ervas','salsa',
            'coentro','manjericão','hortelã','alecrim','tomilho','louro','orégano','erva-doce','açafrão','cardamomo',
            'farinha','trigo','milho','aveia','centeio','cevada','fermento','bicarbonato','canela','baunilha',
            'manteiga','margarina','creme-de-leite','leite-condensado','iogurte','nata','chantilly','queijo-cremoso','requeijão','cottage'
        ],

        programacao: [
            'variavel','constante','funcao','metodo','classe','objeto','array','string','numero','booleano',
            'null','naodefinido','loop','while','switch','case','break','continue','return','throw',
            'try','catch','finally','async','await','promise','callback','event','listener','handler',
            'import','export','default','module','package','require','namespace','scope','closure','hoisting',
            'prototype','instance','constructor','inheritance','polymorphism','encapsulation','abstraction','interface','abstract','virtual',
            'static','public','private','protected','readonly','getter','setter','property','attribute','field',
            'parameter','argument','return','void','type','generic','tuple','enum','union','intersection',
            'compile','transpile','bundle','minify','uglify','sourcemaps','polyfill','shim','transpiler','compiler',
            'debugger','breakpoint','console','log','warn','error','trace','assert','profile','benchmark'
        ],

        internet: [
            'site','pagina','link','banner','popup','cookie','cache','session','token','jwt',
            'login','logout','senha','usuario','email','dominio','hosting','dns','ssl','https',
            'http','tcp','udp','ip','porta','socket','firewall','proxy','vpn','cdn',
            'largura-de-banda','download','upload','streaming','buffer','latencia','ping','traceroute','packets','roteamento',
            'navegador','bookmark','historico','aba','janela','plugin','extensão','add-on','tema','skin',
            'busca','motor-de-busca','seo','pagerank','indexação','crawler','bot','spider','sitemap','robots',
            'redes-sociais','facebook','instagram','twitter','linkedin','youtube','tiktok','telegram','whatsapp','discord',
            'blog','forum','wiki','podcast','vlog','webinar','live','stream','influencer','hashtag'
        ],

        musica: [
            'piano','violao','guitarra','baixo','bateria','saxofone','trompete','trombone','flauta','clarinete',
            'violino','viola','violoncelo','contrabaixo','harpa','gaita','acordeon','sanfona','cavaquinho','bandolim',
            'teclado','sintetizador','berrante','atabaque','conga','bongo','timba','caixa','bumbo','prato',
            'pratos','chimbal','ribeira','ganza','chocalho','agogô','reco-reco','cuíca','pandeiro','tamborim',
            'repinique','surdo','caixa','tarol','alfala','bombardino','eufônio','tuba','trompa','corneta',
            'violão-de-7-cordas','viola-caipira','viola-de-cocho','viola-de-mão','viola-de-arco','rabeca','rabeca','gusli','cavaquinho','cavaquinho',
            'bandolim','bandola','laúde','alaúde','alaúde-árabe','alaúde-de-braco','bandolim-português','guitarra-portuguesa','braguês','braguinha',
            'ukulele','charango','cuatro','tres','tiple','vihuela','jarana','guitarrón','leon','arpa'
        ],

        empresas: [
            'google','microsoft','apple','amazon','meta','netflix','spotify','uber','airbnb','tesla',
            'twitter','linkedin','adobe','oracle','ibm','intel','nvidia','amd','samsung','sony',
            'nintendo','disney','coca-cola','pepsi','mcdonalds','burger-king','starbucks','subway','kfc','pizza-hut',
            'nike','adidas','puma','under-armour','reebok','fila','asics','mizuno','new-balance','skechers',
            'volkswagen','ford','chevrolet','fiat','toyota','honda','nissan','hyundai','bmw','mercedes',
            'audi','porsche','ferrari','lamborghini','maserati','bentley','rolls-royce','jaguar','land-rover','mitsubishi',
            'petrobras','vale','itaú','bradesco','banco-do-brasil','ambev','jbs','localiza','magalu','mercado-livre',
            'magazine-luiza','americanas','submarino','netshoes','lojas-renner','riachuelo','cereser','lojas-americanas','gbarbosa','extra'
        ],

        marcas: [
            'gucci','prada','louis-vuitton','chanel','hermes','dior','versace','armani','ralph-lauren','tommy-hilfiger',
            'calvin-klein','lacoste','polo','boss','burberry','givenchy','valentino','dolce-gabbana','fendi','celine',
            'rolex','omega','cartier','patek-philippe','breitling','tag-heuer','seiko','citizen','casio','swatch',
            'samsung','lg','electrolux','brastemp','consul','philips','panasonic','sharp','mitsubishi','sanyo',
            'braun','bosch','moulinex','oster','black-decker','mondial','arno','cadence','philco','suggar',
            'sansung','huawei','xiaomi','motorola','oneplus','honor','realme','oppo','vivo','tecno',
            'zebra','logitech','razer','corsair','steelseries','hyperx','sennheiser','bose','jbl','beats',
            'sony','akg','audio-technica','shure','behringer','yamaha','roland','korg','native-instruments','focusrite'
        ]
    };

    // Remove duplicatas dentro de cada categoria e normaliza
    const cleanWords = {};
    for (const [category, words] of Object.entries(WORDS)) {
        const seen = new Set();
        cleanWords[category] = [];
        for (const word of words) {
            // Remove acentos e caracteres especiais, mantém apenas letras
            const clean = word
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z]/g, '')
                .toLowerCase()
                .trim();
            if (clean.length >= 3 && !seen.has(clean)) {
                seen.add(clean);
                cleanWords[category].push(clean);
            }
        }
    }

    // Lista de todas as categorias disponíveis
    const CATEGORIES = Object.keys(cleanWords);

    /**
     * Retorna a lista de categorias disponíveis.
     * @returns {string[]}
     */
    function getCategories() {
        return [...CATEGORIES];
    }

    /**
     * Retorna as palavras de uma categoria específica.
     * @param {string} category - Nome da categoria.
     * @returns {string[]}
     */
    function getWords(category) {
        return cleanWords[category] || [];
    }

    /**
     * Retorna palavras de uma categoria filtradas por tamanho mínimo e máximo.
     * @param {string} category - Nome da categoria.
     * @param {number} minLength - Tamanho mínimo da palavra.
     * @param {number} maxLength - Tamanho máximo da palavra (opcional).
     * @returns {string[]}
     */
    function getWordsByLength(category, minLength = 3, maxLength = 20) {
        return (cleanWords[category] || []).filter(
            w => w.length >= minLength && w.length <= maxLength
        );
    }

    /**
     * Seleciona N palavras aleatórias de uma ou mais categorias.
     * Garante que palavras não se repitam em partidas consecutivas
     * usando um histórico de conjuntos recentes.
     * @param {number} count - Quantidade de palavras.
     * @param {string[]} categories - Categorias para escolher (opcional, usa todas se vazio).
     * @param {number} minLength - Tamanho mínimo.
     * @param {number} maxLength - Tamanho máximo.
     * @param {string[]} recentWords - Palavras usadas recentemente (para evitar repetição).
     * @returns {string[]}
     */
    function selectRandomWords(count, categories = [], minLength = 3, maxLength = 20, recentWords = []) {
        const cats = categories.length > 0 ? categories : CATEGORIES;
        let pool = [];
        for (const cat of cats) {
            if (cleanWords[cat]) {
                pool = pool.concat(cleanWords[cat]);
            }
        }

        // Filtra por tamanho
        pool = pool.filter(w => w.length >= minLength && w.length <= maxLength);

        // Remove duplicatas do pool
        pool = [...new Set(pool)];

        // Prioriza palavras que não estão no histórico recente
        const recentSet = new Set(recentWords);
        const freshPool = pool.filter(w => !recentSet.has(w));
        const finalPool = freshPool.length >= count ? freshPool : pool;

        // Embaralha e seleciona
        const shuffled = shuffleArray([...finalPool]);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    /**
     * Retorna o total de palavras no banco.
     * @returns {number}
     */
    function getTotalWordCount() {
        return CATEGORIES.reduce((total, cat) => total + cleanWords[cat].length, 0);
    }

    /**
     * Embaralha um array (Fisher-Yates).
     * @param {Array} arr
     * @returns {Array}
     */
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    return {
        getCategories,
        getWords,
        getWordsByLength,
        selectRandomWords,
        getTotalWordCount
    };
})();

// Exporta para uso em módulos e navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dictionary;
}
