import en from "./en.js";

export const languages = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "es", label: "Español", dir: "ltr" },
];

// Columns: key | Arabic | Turkish | Russian | French | Persian | Spanish.
// Keeping each phrase beside its equivalents makes missing translations visible.
const phrases = `
infillRate|سعر الحشو المصمت / م²|Dolu panel / m²|Сплошное заполнение / м²|Remplissage plein / m²|پنل توپر / مترمربع|Relleno opaco / m²
cutLimit|يتجاوز تقدير القص هذا 100,000 قطعة. قسّم المشروع إلى دفعات أصغر.|Bu kesim tahmini 100.000 parçayı aşıyor. Projeyi daha küçük partilere bölün.|В этом расчёте раскроя более 100 000 деталей. Разделите проект на меньшие партии.|Cette estimation de coupe dépasse 100 000 pièces. Divisez le projet en lots plus petits.|این برآورد برش بیش از 100٬000 قطعه دارد. پروژه را به دسته‌های کوچک‌تر تقسیم کنید.|Esta estimación de corte supera las 100.000 piezas. Divide el proyecto en lotes más pequeños.
studio|استوديو التصميم|Tasarım stüdyosu|Студия дизайна|Atelier de conception|استودیوی طراحی|Estudio de diseño
projects|المشاريع|Projeler|Проекты|Projets|پروژه‌ها|Proyectos
materials|المواد والأسعار|Malzemeler ve fiyatlar|Материалы и расценки|Matériaux et tarifs|مصالح و نرخ‌ها|Materiales y tarifas
reports|التقارير وعرض السعر|Raporlar ve teklif|Отчёты и смета|Rapports et devis|گزارش‌ها و پیش‌فاکتور|Informes y presupuesto
workspace|مساحة العمل|ÇALIŞMA ALANI|РАБОЧЕЕ ПРОСТРАНСТВО|ESPACE DE TRAVAIL|فضای کاری|ESPACIO DE TRABAJO
project|المشروع|PROJE|ПРОЕКТ|PROJET|پروژه|PROYECTO
saved|محفوظ على هذا الجهاز|Bu cihazda kaydedildi|Сохранено на этом устройстве|Enregistré sur cet appareil|در این دستگاه ذخیره شد|Guardado en este dispositivo
local|مساحة عمل محلية|Yerel çalışma alanı|Локальное рабочее пространство|Espace de travail local|فضای کاری محلی|Espacio de trabajo local
localHint|تبقى مشاريعك في هذا المتصفح. صدّر نسخة احتياطية للحفاظ عليها.|Projeleriniz bu tarayıcıda saklanır. Güvende tutmak için yedek dışa aktarın.|Ваши проекты хранятся в этом браузере. Экспортируйте резервную копию для сохранности.|Vos projets restent dans ce navigateur. Exportez une sauvegarde pour les conserver.|پروژه‌ها در این مرورگر می‌مانند. برای نگهداری امن، نسخهٔ پشتیبان صادر کنید.|Tus proyectos se guardan en este navegador. Exporta una copia de seguridad para conservarlos.
backup|تصدير المشروع|Projeyi dışa aktar|Экспорт проекта|Exporter le projet|صدور پروژه|Exportar proyecto
import|استيراد مشروع|Proje içe aktar|Импорт проекта|Importer un projet|ورود پروژه|Importar proyecto
newProject|مشروع جديد|Yeni proje|Новый проект|Nouveau projet|پروژهٔ جدید|Nuevo proyecto
projectName|اسم المشروع|Proje adı|Название проекта|Nom du projet|نام پروژه|Nombre del proyecto
customer|العميل|Müşteri|Заказчик|Client|مشتری|Cliente
email|البريد الإلكتروني / الهاتف|E-posta / telefon|Эл. почта / телефон|E-mail / téléphone|ایمیل / تلفن|Correo / teléfono
reference|المرجع|Referans|Номер заказа|Référence|شناسهٔ مرجع|Referencia
date|التاريخ|Tarih|Дата|Date|تاریخ|Fecha
notes|ملاحظات المشروع|Proje notları|Примечания к проекту|Notes du projet|یادداشت‌های پروژه|Notas del proyecto
designer|مصمم النوافذ والأبواب|Pencere ve kapı tasarımcısı|Конструктор окон и дверей|Concepteur de fenêtres et portes|طراح پنجره و در|Diseñador de ventanas y puertas
designSub|رؤية واضحة لكل تفصيل.|Her ayrıntı net bir şekilde görünür.|Каждая деталь как на ладони.|Une vision claire de chaque détail.|نمایی روشن از هر جزئیات.|Cada detalle a la vista.
addItem|إضافة عنصر|Ürün ekle|Добавить изделие|Ajouter un élément|افزودن مورد|Añadir elemento
items|عناصر المشروع|Proje ürünleri|Изделия проекта|Éléments du projet|موارد پروژه|Elementos del proyecto
item|العنصر|Ürün|Изделие|Élément|مورد|Elemento
noItems|يبدأ مشروعك بإطار واحد.|Projeniz tek bir çerçeveyle başlar.|Ваш проект начинается с одной рамы.|Votre projet commence par un cadre.|پروژهٔ شما با یک قاب شروع می‌شود.|Tu proyecto empieza con un marco.
startItem|اختر قالبًا لبدء التصميم.|Tasarıma başlamak için bir şablon seçin.|Выберите шаблон, чтобы начать.|Choisissez un modèle pour commencer.|برای شروع طراحی، یک الگو انتخاب کنید.|Elige una plantilla para empezar a diseñar.
dimensions|الأبعاد|Ölçüler|Размеры|Dimensions|ابعاد|Dimensiones
width|العرض|Genişlik|Ширина|Largeur|عرض|Anchura
height|الارتفاع|Yükseklik|Высота|Hauteur|ارتفاع|Altura
quantity|الكمية|Adet|Количество|Quantité|تعداد|Cantidad
layout|تقسيم الألواح|Panel düzeni|Расположение секций|Disposition des panneaux|چیدمان پنل‌ها|Distribución de paneles
columns|الأعمدة|Sütunlar|Столбцы|Colonnes|ستون‌ها|Columnas
rows|الصفوف|Satırlar|Ряды|Rangées|ردیف‌ها|Filas
selectedPanel|اللوح المحدد|Seçili panel|Выбранная секция|Panneau sélectionné|پنل انتخاب‌شده|Panel seleccionado
panelHint|حدد لوحًا في الرسم، ثم اختر طريقة فتحه.|Çizimde bir panel seçin, ardından açılma biçimini belirleyin.|Выберите секцию на чертеже, затем способ открывания.|Sélectionnez un panneau sur le dessin, puis son mode d’ouverture.|یک پنل را در نقشه انتخاب کنید، سپس نوع بازشو را تعیین کنید.|Selecciona un panel en el dibujo y elige cómo se abre.
opening|نوع الفتح|Açılma biçimi|Тип открывания|Type d’ouverture|نوع بازشو|Tipo de apertura
fixed|ثابت|Sabit|Глухая|Fixe|ثابت|Fijo
left|مفصلات يسار|Sola açılır|Поворотная левая|Battant gauche|لولایی چپ|Abatible izquierda
right|مفصلات يمين|Sağa açılır|Поворотная правая|Battant droit|لولایی راست|Abatible derecha
tilt|قلاب|Vasistas|Откидная|À soufflet|کلنگی|Basculante
tilt-turn|قلاب ومفصلي|Çift açılım|Поворотно-откидная|Oscillo-battant|دوحالته|Oscilobatiente
slide-left|جرار لليسار|Sola sürgülü|Сдвижная влево|Coulissant gauche|کشویی چپ|Corredera izquierda
slide-right|جرار لليمين|Sağa sürgülü|Сдвижная вправо|Coulissant droit|کشویی راست|Corredera derecha
solid|لوح مصمت|Dolu panel|Сплошная панель|Panneau plein|پنل توپر|Panel opaco
material|المادة|Malzeme|Материал|Matériau|جنس|Material
finish|تشطيب الإطار|Çerçeve kaplaması|Отделка рамы|Finition du cadre|پوشش قاب|Acabado del marco
white|أبيض|Beyaz|Белый|Blanc|سفید|Blanco
beige|بيج|Bej|Бежевый|Beige|بژ|Beis
cream|كريمي|Krem|Кремовый|Crème|کرم|Crema
sand|رملي|Kum|Песочный|Sable|شنی|Arena
grey|رمادي|Gri|Серый|Gris|خاکستری|Gris
black|أسود|Siyah|Чёрный|Noir|مشکی|Negro
brown|بني|Kahverengi|Коричневый|Marron|قهوه‌ای|Marrón
bronze|برونزي|Bronz|Бронзовый|Bronze|برنزی|Bronce
silver|فضي|Gümüş|Серебристый|Argent|نقره‌ای|Plateado
anthracite|رمادي فحمي|Antrasit|Антрацит|Anthracite|خاکستری تیره|Antracita
oak|بلوط ذهبي|Altın meşe|Золотой дуб|Chêne doré|بلوط طلایی|Roble dorado
glazing|الزجاج|Cam türü|Остекление|Vitrage|شیشه‌کاری|Acristalamiento
single|زجاج مفرد|Tek cam|Одинарное стекло|Simple vitrage|شیشهٔ تک‌جداره|Vidrio simple
double|زجاج مزدوج|Çift cam|Двойное остекление|Double vitrage|شیشهٔ دوجداره|Doble acristalamiento
triple|زجاج ثلاثي|Üçlü cam|Тройное остекление|Triple vitrage|شیشهٔ سه‌جداره|Triple acristalamiento
profile|عرض وجه الإطار / الفاصل|Kasa / kayıt görünür genişliği|Видимая ширина рамы / импоста|Largeur visible du cadre / montant|عرض نمای قاب / تقسیم‌کننده|Ancho visible del marco / travesaño
sash|عرض وجه الضلفة|Kanat görünür genişliği|Видимая ширина створки|Largeur visible de l’ouvrant|عرض نمای لنگه|Ancho visible de la hoja
advanced|أبعاد القطاعات|Profil ölçüleri|Размеры профилей|Dimensions des profilés|ابعاد پروفیل|Dimensiones de perfiles
itemName|اسم العنصر|Ürün adı|Название изделия|Nom de l’élément|نام مورد|Nombre del elemento
duplicate|نسخ العنصر|Ürünü çoğalt|Дублировать изделие|Dupliquer l’élément|تکثیر مورد|Duplicar elemento
remove|حذف العنصر|Ürünü kaldır|Удалить изделие|Supprimer l’élément|حذف مورد|Eliminar elemento
undo|تراجع|Geri al|Отменить|Annuler|واگرد|Deshacer
redo|إعادة|Yinele|Повторить|Rétablir|ازنو|Rehacer
zoomIn|تكبير|Yakınlaştır|Увеличить|Agrandir|بزرگ‌نمایی|Acercar
zoomOut|تصغير|Uzaklaştır|Уменьшить|Réduire|کوچک‌نمایی|Alejar
resetZoom|إعادة ضبط التكبير|Yakınlaştırmayı sıfırla|Сбросить масштаб|Réinitialiser le zoom|بازنشانی بزرگ‌نمایی|Restablecer zoom
frontView|الواجهة الأمامية|ÖN GÖRÜNÜŞ|ВИД СПЕРЕДИ|VUE DE FACE|نمای روبه‌رو|VISTA FRONTAL
mm|مم|mm|мм|mm|میلی‌متر|mm
preview|معاينة التصميم|Tasarım önizlemesi|Предпросмотр проекта|Aperçu du dessin|پیش‌نمایش طرح|Vista previa del diseño
profileLength|طول القطاعات|Profil uzunluğu|Длина профиля|Longueur des profilés|طول پروفیل|Longitud de perfiles
glassArea|مساحة الزجاج|Cam alanı|Площадь стекла|Surface vitrée|مساحت شیشه|Superficie de vidrio
itemEstimate|تقدير العنصر|Ürün tahmini|Оценка изделия|Estimation de l’élément|برآورد مورد|Estimación del elemento
projectTotal|إجمالي المشروع|Proje toplamı|Итого по проекту|Total du projet|مجموع پروژه|Total del proyecto
viewQuote|عرض عرض السعر|Teklifi görüntüle|Открыть смету|Voir le devis|مشاهدهٔ پیش‌فاکتور|Ver presupuesto
estimated|الإجمالي التقديري|TAHMİNİ TOPLAM|ПРЕДВАРИТЕЛЬНЫЙ ИТОГ|TOTAL ESTIMÉ|مجموع برآوردی|TOTAL ESTIMADO
units|وحدات|adet|шт.|unités|واحد|unidades
unit|وحدة|adet|шт.|unité|واحد|unidad
edit|تعديل|Düzenle|Изменить|Modifier|ویرایش|Editar
template|اختر نقطة البداية|Bir başlangıç noktası seçin|Выберите основу|Choisissez un point de départ|نقطهٔ شروع را انتخاب کنید|Elige un punto de partida
templateSub|ابدأ ببساطة. عدّل كل بُعد ولوح.|Basit başlayın. Her ölçüyü ve paneli ayarlayın.|Начните с простого. Настройте размеры и секции.|Commencez simplement. Ajustez chaque dimension et panneau.|ساده شروع کنید. هر بُعد و پنل را تنظیم کنید.|Empieza con algo sencillo. Ajusta cada dimensión y panel.
casement|نافذة مفصلية|Menteşeli pencere|Поворотное окно|Fenêtre à battant|پنجرهٔ لولایی|Ventana abatible
sliding|نافذة جرارة|Sürme pencere|Раздвижное окно|Fenêtre coulissante|پنجرهٔ کشویی|Ventana corredera
door|باب مدخل|Giriş kapısı|Входная дверь|Porte d’entrée|در ورودی|Puerta de entrada
fixedTemplate|نافذة ثابتة|Sabit pencere|Глухое окно|Fenêtre fixe|پنجرهٔ ثابت|Ventana fija
tiltTemplate|نافذة قلاب ومفصلية|Çift açılım pencere|Поворотно-откидное окно|Fenêtre oscillo-battante|پنجرهٔ دوحالته|Ventana oscilobatiente
tripleTemplate|نافذة بثلاثة ألواح|Üç panelli pencere|Трёхсекционное окно|Fenêtre à trois panneaux|پنجرهٔ سه‌پنلی|Ventana de tres paneles
transom|نافذة بشباك علوي|Üst bölmeli pencere|Окно с фрамугой|Fenêtre avec imposte|پنجره با کتیبه|Ventana con montante superior
cancel|إلغاء|İptal|Отмена|Annuler|انصراف|Cancelar
create|إنشاء مشروع|Proje oluştur|Создать проект|Créer le projet|ایجاد پروژه|Crear proyecto
deleteProject|حذف المشروع|Projeyi sil|Удалить проект|Supprimer le projet|حذف پروژه|Eliminar proyecto
deleteTitle|حذف هذا المشروع؟|Bu proje silinsin mi?|Удалить этот проект?|Supprimer ce projet ?|این پروژه حذف شود؟|¿Eliminar este proyecto?
deleteHint|سيُحذف المشروع من هذا المتصفح. صدّر نسخة احتياطية أولًا إذا كنت تحتاجه.|Proje bu tarayıcıdan silinir. Gerekliyse önce bir yedek dışa aktarın.|Проект будет удалён из этого браузера. При необходимости сначала экспортируйте резервную копию.|Le projet sera supprimé de ce navigateur. Exportez d’abord une sauvegarde si nécessaire.|پروژه از این مرورگر حذف می‌شود. اگر به آن نیاز دارید، ابتدا نسخهٔ پشتیبان صادر کنید.|El proyecto se eliminará de este navegador. Exporta primero una copia de seguridad si lo necesitas.
delete|حذف|Kaldır|Удалить|Supprimer|حذف|Eliminar
emptyProjects|لا توجد مشاريع بعد|Henüz proje yok|Пока нет проектов|Aucun projet pour le moment|هنوز پروژه‌ای وجود ندارد|Todavía no hay proyectos
projectsSub|من أول قياس إلى عرض السعر النهائي.|İlk ölçümden son teklife kadar.|От первого замера до готовой сметы.|Du premier relevé au devis final.|از اولین اندازه‌گیری تا پیش‌فاکتور نهایی.|Desde la primera medida hasta el presupuesto final.
openProject|فتح المشروع|Projeyi aç|Открыть проект|Ouvrir le projet|باز کردن پروژه|Abrir proyecto
projectDetails|تفاصيل المشروع|Proje ayrıntıları|Сведения о проекте|Détails du projet|جزئیات پروژه|Detalles del proyecto
ratesTitle|اضبط الأسعار بما يناسبك.|Fiyatları kendinize göre ayarlayın.|Настройте свои расценки.|Adaptez les tarifs à votre activité.|نرخ‌ها را مطابق کار خود تنظیم کنید.|Ajusta las cifras a tu negocio.
ratesSub|أدخل أسعار المورد مرة واحدة. تتحدث جميع التقديرات فورًا.|Tedarikçi fiyatlarını bir kez girin. Tüm tahminler anında güncellenir.|Укажите расценки поставщика один раз. Все расчёты обновятся сразу.|Saisissez vos tarifs fournisseurs une fois. Toutes les estimations se mettent à jour instantanément.|نرخ‌های تأمین‌کننده را یک‌بار وارد کنید. همهٔ برآوردها فوراً به‌روز می‌شوند.|Introduce las tarifas de tu proveedor una vez. Todas las estimaciones se actualizan al instante.
currency|العملة|Para birimi|Валюта|Devise|ارز|Moneda
rateProfile|سعر القطاع / م|Profil fiyatı / m|Цена профиля / м|Tarif profilé / m|نرخ پروفیل / متر|Tarifa de perfil / m
rateGlass|سعر الزجاج / م²|Cam fiyatı / m²|Цена стекла / м²|Tarif vitrage / m²|نرخ شیشه / مترمربع|Tarifa de vidrio / m²
hardware|الإكسسوارات / ضلفة فتح|Donanım / açılır kanat|Фурнитура / створка|Quincaillerie / ouvrant|یراق‌آلات / لنگهٔ بازشو|Herrajes / hoja practicable
labor|المصنعية / وحدة|İşçilik / adet|Работа / изделие|Main-d’œuvre / unité|دستمزد / واحد|Mano de obra / unidad
waste|هامش هالك المواد %|Malzeme payı %|Запас материала %|Marge de perte matière %|اضافهٔ مصالح %|Margen de material %
markup|نسبة الإضافة %|Kâr ilavesi %|Наценка %|Majoration %|درصد افزایش قیمت %|Recargo %
discount|الخصم %|İndirim %|Скидка %|Remise %|تخفیف %|Descuento %
tax|الضريبة %|Vergi %|Налог %|Taxe %|مالیات %|Impuesto %
stockLength|طول عود الخام|Stok çubuk uzunluğu|Длина заготовки|Longueur des barres|طول شاخهٔ خام|Longitud de barra
kerf|عرض قطع المنشار|Testere kesim payı|Ширина пропила|Largeur du trait de scie|عرض برش اره|Ancho de corte de sierra
costSettings|التكلفة والتسعير|Maliyet ve fiyatlandırma|Стоимость и ценообразование|Coûts et tarification|هزینه و قیمت‌گذاری|Costes y precios
cuttingSettings|إعدادات القص|Kesim ayarları|Настройка раскроя|Paramètres de coupe|تنظیمات برش|Configuración de corte
estimateNote|تقدير للتخطيط · خصومات أبعاد عامة للقطاعات. تحقق من أبعاد المورد قبل التصنيع.|Planlama tahmini · Genel profil düşümleri kullanılır. Üretimden önce tedarikçi ölçülerini doğrulayın.|Предварительный расчёт · Типовые вычеты профиля. Перед изготовлением уточните размеры у поставщика.|Estimation indicative · Déductions génériques des profilés. Vérifiez les dimensions fournisseur avant fabrication.|برآورد برنامه‌ریزی · کسر ابعاد پروفیل به‌صورت عمومی است. پیش از ساخت، ابعاد تأمین‌کننده را تأیید کنید.|Estimación orientativa · Deducciones genéricas de perfiles. Confirma las dimensiones del proveedor antes de fabricar.
materialsNote|هذه أسعار تجريبية. استبدلها بأسعار المورد قبل تقديم عرض السعر.|Bunlar örnek fiyatlardır. Teklif vermeden önce tedarikçi fiyatlarınızla değiştirin.|Это примерные расценки. Перед подготовкой сметы замените их ценами поставщика.|Ces tarifs sont des exemples. Remplacez-les par ceux de votre fournisseur avant de chiffrer.|این نرخ‌ها نمونه هستند. پیش از ارائهٔ قیمت، آن‌ها را با قیمت‌های تأمین‌کننده جایگزین کنید.|Estas tarifas son de ejemplo. Sustitúyelas por los precios de tu proveedor antes de presupuestar.
quote|عرض السعر|Fiyat teklifi|Смета|Devis|پیش‌فاکتور|Presupuesto
bill|قائمة المواد|Malzeme listesi|Ведомость материалов|Nomenclature des matériaux|فهرست مصالح|Lista de materiales
cutting|تقدير القص|Kesim tahmini|Предварительный раскрой|Estimation de coupe|برآورد برش|Estimación de corte
reportsSub|حوّل تصميمك إلى خطة واضحة قابلة للمشاركة.|Tasarımınızı anlaşılır ve paylaşılabilir bir plana dönüştürün.|Превратите проект в понятный план, которым можно поделиться.|Transformez votre dessin en un plan clair à partager.|طرح خود را به برنامه‌ای روشن و قابل‌اشتراک تبدیل کنید.|Convierte tu diseño en un plan claro que puedas compartir.
print|طباعة / حفظ PDF|Yazdır / PDF kaydet|Печать / Сохранить PDF|Imprimer / Enregistrer en PDF|چاپ / ذخیرهٔ PDF|Imprimir / Guardar PDF
exportCsv|تصدير CSV|CSV dışa aktar|Экспорт CSV|Exporter en CSV|صدور CSV|Exportar CSV
exportSvg|تصدير الرسم|Çizimi dışa aktar|Экспорт чертежа|Exporter le dessin|صدور نقشه|Exportar dibujo
description|الوصف|Açıklama|Описание|Description|شرح|Descripción
size|المقاس|Boyut|Размер|Dimensions|اندازه|Tamaño
unitPrice|سعر الوحدة|Birim fiyat|Цена за единицу|Prix unitaire|قیمت واحد|Precio unitario
amount|المبلغ|Tutar|Сумма|Montant|مبلغ|Importe
subtotal|المجموع الفرعي|Ara toplam|Промежуточный итог|Sous-total|جمع جزء|Subtotal
discountAmount|الخصم|İndirim|Скидка|Remise|تخفیف|Descuento
taxAmount|الضريبة|Vergi|Налог|Taxe|مالیات|Impuesto
total|الإجمالي|Toplam|Итого|Total|مجموع|Total
preparedFor|مُعدّ لصالح|HAZIRLANAN MÜŞTERİ|ЗАКАЗЧИК|DESTINATAIRE|تهیه‌شده برای|PREPARADO PARA
noCustomer|أضف بيانات العميل|Müşteri bilgilerini ekleyin|Добавьте сведения о заказчике|Ajoutez les coordonnées du client|اطلاعات مشتری را اضافه کنید|Añade los datos del cliente
terms|الملاحظات والشروط|Notlar ve koşullar|Примечания и условия|Notes et conditions|یادداشت‌ها و شرایط|Notas y condiciones
profileParts|مكونات القطاعات|Profil bileşenleri|Детали профиля|Éléments de profilés|اجزای پروفیل|Componentes de perfiles
glassPieces|قطع الزجاج|Cam parçaları|Стёкла|Panneaux de verre|قطعات شیشه|Piezas de vidrio
type|النوع|Tür|Тип|Type|نوع|Tipo
length|الطول|Uzunluk|Длина|Longueur|طول|Longitud
pieces|القطع|Parça|Штук|Pièces|قطعه|Piezas
frame|الإطار|Kasa|Рама|Cadre|قاب|Marco
divider|الفاصل|Kayıt|Импост|Montant de séparation|تقسیم‌کننده|Travesaño
sashType|الضلفة|Kanat|Створка|Ouvrant|لنگه|Hoja
totalLength|الطول الإجمالي|Toplam uzunluk|Общая длина|Longueur totale|طول کل|Longitud total
stockBars|أعواد الخام|Stok çubuklar|Заготовки|Barres|شاخه‌های خام|Barras
offcut|المتبقي من القص|Artan parça|Остаток|Chute|باقی‌ماندهٔ برش|Retal
utilization|نسبة الاستغلال|Kullanım oranı|Использование|Taux d’utilisation|نرخ استفاده|Aprovechamiento
bar|عود|Çubuk|Заготовка|Barre|شاخه|Barra
oversized|تتجاوز بعض القطع طول عود الخام. زِد طول الخام قبل القص.|Bazı parçalar stok uzunluğunu aşıyor. Kesimden önce stok uzunluğunu artırın.|Детали длиннее заготовки. Увеличьте длину заготовки перед раскроем.|Certaines pièces dépassent la longueur des barres. Augmentez-la avant la coupe.|برخی قطعات از شاخهٔ خام بلندترند. پیش از برش، طول شاخه را افزایش دهید.|Hay piezas que superan la longitud de barra. Auméntala antes de cortar.
noCuts|أضف عنصرًا لإنشاء تقدير القص.|Kesim tahmini oluşturmak için bir ürün ekleyin.|Добавьте изделие для расчёта раскроя.|Ajoutez un élément pour estimer la coupe.|برای ایجاد برآورد برش، یک مورد اضافه کنید.|Añade un elemento para generar una estimación de corte.
noItemsReport|أضف عنصرًا في استوديو التصميم لإنشاء التقرير.|Rapor oluşturmak için tasarım stüdyosunda bir ürün ekleyin.|Добавьте изделие в студии дизайна для создания отчёта.|Ajoutez un élément dans l’atelier pour générer votre rapport.|برای ایجاد گزارش، یک مورد در استودیوی طراحی اضافه کنید.|Añade un elemento en el estudio de diseño para generar el informe.
savedToast|تم حفظ المشروع|Proje kaydedildi|Проект сохранён|Projet enregistré|پروژه ذخیره شد|Proyecto guardado
addedToast|تمت إضافة العنصر|Ürün eklendi|Изделие добавлено|Élément ajouté|مورد اضافه شد|Elemento añadido
removedToast|تم حذف العنصر. استخدم التراجع لاستعادته.|Ürün kaldırıldı. Geri al ile geri yükleyebilirsiniz.|Изделие удалено. Используйте отмену для восстановления.|Élément supprimé. Annulez pour le restaurer.|مورد حذف شد. برای بازیابی، واگرد را بزنید.|Elemento eliminado. Usa Deshacer para recuperarlo.
importedToast|تم استيراد المشروع|Proje içe aktarıldı|Проект импортирован|Projet importé|پروژه وارد شد|Proyecto importado
exportToast|تم تنزيل النسخة الاحتياطية للمشروع|Proje yedeği indirildi|Резервная копия проекта скачана|Sauvegarde du projet téléchargée|نسخهٔ پشتیبان پروژه دانلود شد|Copia de seguridad descargada
invalidFile|هذا الملف ليس مشروع Frame Workshop صالحًا.|Bu dosya geçerli bir Frame Workshop projesi değil.|Этот файл не является допустимым проектом Frame Workshop.|Ce fichier n’est pas un projet Frame Workshop valide.|این فایل، پروژهٔ معتبر Frame Workshop نیست.|Este archivo no es un proyecto válido de Frame Workshop.
storageError|مساحة تخزين المتصفح غير متاحة أو ممتلئة. صدّر مشروعك للاحتفاظ بالتغييرات.|Tarayıcı depolaması kullanılamıyor veya dolu. Değişiklikleri korumak için projeyi dışa aktarın.|Хранилище браузера недоступно или заполнено. Экспортируйте проект, чтобы сохранить изменения.|Le stockage du navigateur est indisponible ou plein. Exportez votre projet pour conserver vos modifications.|حافظهٔ مرورگر در دسترس نیست یا پر شده است. برای حفظ تغییرات، پروژه را صادر کنید.|El almacenamiento del navegador no está disponible o está lleno. Exporta el proyecto para conservar los cambios.
restoreError|تعذر تحميل البيانات المحفوظة ولم يتم استبدالها. صدّر عملك الجديد بشكل منفصل.|Kayıtlı veriler yüklenemedi ve üzerlerine yazılmadı. Yeni çalışmanızı ayrı dışa aktarın.|Не удалось загрузить сохранённые данные. Они не перезаписаны. Экспортируйте новую работу отдельно.|Les données enregistrées n’ont pas pu être chargées et n’ont pas été écrasées. Exportez votre nouveau travail séparément.|داده‌های ذخیره‌شده بارگیری نشدند و بازنویسی نشده‌اند. کار جدید را جداگانه صادر کنید.|No se pudieron cargar los datos guardados. No se han sobrescrito. Exporta el trabajo nuevo por separado.
itemLimit|يمكن أن يحتوي المشروع على 100 عنصر كحد أقصى.|Bir proje en fazla 100 ürün içerebilir.|Проект может содержать до 100 изделий.|Un projet peut contenir jusqu’à 100 éléments.|هر پروژه می‌تواند حداکثر 100 مورد داشته باشد.|Un proyecto puede contener hasta 100 elementos.
projectLimit|يمكن أن تحتوي مساحة العمل على 50 مشروعًا كحد أقصى.|Bu çalışma alanı en fazla 50 proje içerebilir.|Рабочее пространство может содержать до 50 проектов.|Cet espace peut contenir jusqu’à 50 projets.|این فضای کاری می‌تواند حداکثر 50 پروژه داشته باشد.|Este espacio puede contener hasta 50 proyectos.
language|اللغة|Dil|Язык|Langue|زبان|Idioma
close|إغلاق|Kapat|Закрыть|Fermer|بستن|Cerrar
unnamed|مشروع بلا عنوان|Adsız proje|Проект без названия|Projet sans titre|پروژهٔ بدون عنوان|Proyecto sin título
sample|مشروع تجريبي|ÖRNEK PROJE|ПРИМЕР ПРОЕКТА|PROJET EXEMPLE|پروژهٔ نمونه|PROYECTO DE EJEMPLO
sampleName|تجديد منزل الحديقة|Bahçe evi yenilemesi|Ремонт садового дома|Rénovation de la maison du jardin|بازسازی خانهٔ باغ|Renovación de la casa del jardín
sampleCustomer|أليكس مورغان|Alex Morgan|Алекс Морган|Alex Morgan|الکس مورگان|Alex Morgan
sampleItem|نافذة غرفة المعيشة|Oturma odası penceresi|Окно гостиной|Fenêtre du salon|پنجرهٔ نشیمن|Ventana del salón
sampleNotes|تقدير للتخطيط. تُعتمد القياسات النهائية ومواصفات المواد في الموقع.|Planlama tahmini. Kesin ölçüler ve malzeme özellikleri yerinde doğrulanacaktır.|Предварительный расчёт. Окончательные размеры и характеристики материалов уточняются на объекте.|Estimation indicative. Les mesures finales et les caractéristiques des matériaux restent à confirmer sur place.|برآورد برنامه‌ریزی. اندازه‌های نهایی و مشخصات مصالح باید در محل تأیید شوند.|Estimación orientativa. Las medidas finales y las especificaciones de materiales se confirmarán en obra.
sampleLabel|مشروع تجريبي · جاهز للاستكشاف|Örnek proje · Keşfetmeye hazır|Пример проекта · Можно изучить|Projet exemple · Prêt à explorer|پروژهٔ نمونه · آمادهٔ بررسی|Proyecto de ejemplo · Listo para explorar
totalArea|المساحة الإجمالية|Toplam alan|Общая площадь|Surface totale|مساحت کل|Superficie total
windowsDoors|النوافذ والأبواب|Pencereler ve kapılar|Окна и двери|Fenêtres et portes|پنجره‌ها و درها|Ventanas y puertas
allProjects|جميع المشاريع|Tüm projeler|Все проекты|Tous les projets|همهٔ پروژه‌ها|Todos los proyectos
help|طريقة الاستخدام|Nasıl çalışır|Как это работает|Mode d’emploi|روش کار|Cómo funciona
helpTitle|من الفكرة إلى عرض السعر|Fikirden teklife|От идеи до сметы|De l’idée au devis|از ایده تا پیش‌فاکتور|De la idea al presupuesto
step1|1. أضف نافذة أو بابًا|1. Pencere veya kapı ekleyin|1. Добавьте окно или дверь|1. Ajoutez une fenêtre ou une porte|1. یک پنجره یا در اضافه کنید|1. Añade una ventana o puerta
step1Text|اختر قالبًا، وأدخل الأبعاد بالمليمتر، وحدد الكمية.|Bir şablon seçin, ölçüleri milimetre olarak girin ve adedi belirleyin.|Выберите шаблон, введите размеры в миллиметрах и задайте количество.|Choisissez un modèle, saisissez les dimensions en millimètres et indiquez la quantité.|یک الگو انتخاب کنید، ابعاد را به میلی‌متر وارد کنید و تعداد را تعیین کنید.|Elige una plantilla, introduce las dimensiones en milímetros y define la cantidad.
step2|2. خصص التصميم|2. Kendinize göre düzenleyin|2. Настройте под себя|2. Personnalisez votre dessin|2. طرح را شخصی‌سازی کنید|2. Personaliza el diseño
step2Text|حدد كل لوح لضبط طريقة فتحه، ثم اختر المادة والتشطيب والزجاج.|Her paneli seçerek açılma biçimini ayarlayın, ardından malzeme, kaplama ve camı seçin.|Выберите тип открывания каждой секции, затем материал, отделку и остекление.|Réglez l’ouverture de chaque panneau, puis choisissez le matériau, la finition et le vitrage.|نوع بازشوی هر پنل را تعیین کنید، سپس جنس، پوشش و شیشه را انتخاب کنید.|Selecciona cada panel para ajustar su apertura y elige el material, acabado y acristalamiento.
step3|3. راجع الأسعار|3. Fiyatları kontrol edin|3. Проверьте расценки|3. Vérifiez vos tarifs|3. نرخ‌ها را بررسی کنید|3. Revisa las tarifas
step3Text|استبدل الأسعار التجريبية بأسعار المورد واضبط المصنعية ونسبة الإضافة والضريبة.|Örnek fiyatları tedarikçi fiyatlarıyla değiştirin; işçilik, kâr ilavesi ve vergiyi ayarlayın.|Замените примерные расценки ценами поставщика, настройте стоимость работы, наценку и налог.|Remplacez les exemples par vos tarifs fournisseurs et ajustez la main-d’œuvre, la majoration et la taxe.|نرخ‌های نمونه را با قیمت‌های تأمین‌کننده جایگزین کنید و دستمزد، افزایش قیمت و مالیات را تنظیم کنید.|Sustituye las tarifas de ejemplo por los precios del proveedor y ajusta mano de obra, recargo e impuesto.
step4|4. شارك الخطة|4. Planı paylaşın|4. Поделитесь планом|4. Partagez le plan|4. برنامه را به اشتراک بگذارید|4. Comparte el plan
step4Text|اطبع عرض السعر بصيغة PDF، وصدّر الرسم أو ملف CSV، واحفظ نسخة احتياطية للمشروع بصيغة JSON.|Teklifi PDF olarak yazdırın, çizimi veya CSV dosyasını dışa aktarın ve projeyi JSON olarak yedekleyin.|Сохраните смету в PDF, экспортируйте чертёж или CSV и создайте резервную копию проекта в JSON.|Imprimez le devis en PDF, exportez un dessin ou un CSV et sauvegardez le projet en JSON.|پیش‌فاکتور را به‌صورت PDF چاپ کنید، نقشه یا CSV صادر کنید و از پروژه با قالب JSON پشتیبان بگیرید.|Imprime el presupuesto como PDF, exporta un dibujo o CSV y guarda una copia del proyecto en JSON.
coverage|حول هذا الإصدار|Bu sürüm hakkında|Об этой версии|À propos de cette version|دربارهٔ این نسخه|Acerca de esta versión
coverageText|تنفيذ مستقل ومبسط. لم يتم التحقق من توافق ملفات iWindoor المكتبي أو كتالوجات القطاعات الخاصة أو مخرجات CNC أو التطابق الكامل مع تطبيق سطح المكتب. حسابات القص والتسعير تقديرات للتخطيط.|Bağımsız, sadeleştirilmiş bir uygulamadır. Masaüstü iWindoor dosya uyumluluğu, özel profil katalogları, CNC çıktısı ve tüm masaüstü özellikleriyle eşdeğerlik doğrulanmamıştır. Kesim ve fiyatlandırma planlama tahminleridir.|Независимая упрощённая реализация. Совместимость с файлами настольного iWindoor, фирменные каталоги профилей, вывод для ЧПУ и полное соответствие настольной версии не проверены. Раскрой и цены являются предварительными расчётами.|Réalisation indépendante et simplifiée. La compatibilité avec les fichiers iWindoor, les catalogues propriétaires, la sortie CNC et l’équivalence complète avec le logiciel de bureau ne sont pas vérifiées. Les coupes et prix sont des estimations indicatives.|پیاده‌سازی مستقل و ساده‌شده. سازگاری با فایل‌های نسخهٔ دسکتاپ iWindoor، کاتالوگ‌های اختصاصی پروفیل، خروجی CNC و برابری کامل با نسخهٔ دسکتاپ تأیید نشده است. برش و قیمت‌گذاری، برآوردهای برنامه‌ریزی هستند.|Implementación independiente y simplificada. No se han verificado la compatibilidad con archivos de iWindoor, los catálogos propietarios, la salida CNC ni la equivalencia completa con la aplicación de escritorio. Los cortes y precios son estimaciones orientativas.
unsaved|غير محفوظ · صدّر نسخة احتياطية|Kaydedilmedi · Yedek dışa aktarın|Не сохранено · Экспортируйте копию|Non enregistré · Exportez une sauvegarde|ذخیره نشده · پشتیبان صادر کنید|Sin guardar · Exporta una copia
copy|نسخة|kopya|копия|copie|کپی|copia
panel|لوح|Panel|Секция|Panneau|پنل|Panel
chooseProject|اختر مشروعًا|Proje seçin|Выберите проект|Choisir un projet|انتخاب پروژه|Elegir proyecto
languageHint|لغة الواجهة|Arayüz dili|Язык интерфейса|Langue de l’interface|زبان رابط کاربری|Idioma de la interfaz
projectCount|مشاريع|proje|проектов|projets|پروژه|proyectos
download|تنزيل|İndir|Скачать|Télécharger|دانلود|Descargar
noProject|أنشئ مشروعًا للبدء.|Başlamak için bir proje oluşturun.|Создайте проект, чтобы начать.|Créez un projet pour commencer.|برای شروع، یک پروژه ایجاد کنید.|Crea un proyecto para empezar.
add|إضافة|Ekle|Добавить|Ajouter|افزودن|Añadir
saving|حفظ|Kaydet|Сохранить|Enregistrer|ذخیره|Guardar
invalidNumber|أدخل رقمًا صالحًا ضمن النطاق المحدد.|Belirtilen aralıkta geçerli bir sayı girin.|Введите допустимое число в указанном диапазоне.|Saisissez un nombre valide dans la plage indiquée.|عددی معتبر در بازهٔ مشخص‌شده وارد کنید.|Introduce un número válido dentro del intervalo indicado.
faceHint|عروض القطاعات الظاهرة المستخدمة لخصم أبعاد الزجاج بشكل تقريبي.|Yaklaşık cam ölçüsü düşümleri için kullanılan görünür profil genişlikleri.|Видимая ширина профилей для приблизительного расчёта размеров стекла.|Largeurs visibles des profilés utilisées pour les déductions approximatives du vitrage.|عرض نمای پروفیل‌ها برای کسر تقریبی ابعاد شیشه استفاده می‌شود.|Anchos visibles de perfiles usados para deducciones aproximadas del vidrio.
glass|الزجاج|Cam|Стекло|Verre|شیشه|Vidrio
details|التفاصيل|Ayrıntılar|Подробности|Détails|جزئیات|Detalles
savedAt|محفوظ محليًا|Yerel olarak kaydedildi|Сохранено локально|Enregistré localement|ذخیره‌شده به‌صورت محلی|Guardado localmente
confirmRemoveItem|حذف هذا العنصر؟|Bu ürün kaldırılsın mı?|Удалить это изделие?|Supprimer cet élément ?|این مورد حذف شود؟|¿Eliminar este elemento?
importHint|استيراد نسخة احتياطية من Frame Workshop بصيغة JSON|Frame Workshop JSON yedeğini içe aktar|Импорт резервной копии Frame Workshop в JSON|Importer une sauvegarde JSON Frame Workshop|ورود نسخهٔ پشتیبان JSON از Frame Workshop|Importar una copia JSON de Frame Workshop
newProjectHint|مساحة عمل جديدة لتركيباتك القادمة.|Bir sonraki montajınız için yeni bir çalışma alanı.|Новое рабочее пространство для следующего заказа.|Un nouvel espace pour votre prochaine installation.|فضای کاری تازه برای نصب بعدی شما.|Un espacio nuevo para tu próxima instalación.
projectPlaceholder|مثال: منزل النهر|Örn. Nehir kenarı konutu|Например: Дом у реки|Ex. : Résidence des Rives|مثلاً: خانهٔ کنار رودخانه|Ej.: Residencia del Río
customerPlaceholder|اسم العميل أو الشركة|Müşteri veya şirket adı|Имя заказчика или название компании|Nom du client ou de l’entreprise|نام مشتری یا شرکت|Nombre del cliente o empresa
selectTemplate|اختر القالب|Şablon seç|Выбрать шаблон|Sélectionner un modèle|انتخاب الگو|Seleccionar plantilla
totalCost|التكلفة التقديرية|Tahmini maliyet|Расчётная себестоимость|Coût estimé|هزینهٔ برآوردی|Coste estimado
profit|الإضافة المشمولة|Dahil edilen kâr ilavesi|Включённая наценка|Majoration incluse|افزایش قیمت لحاظ‌شده|Recargo incluido
openingCount|الألواح القابلة للفتح|Açılır paneller|Открывающиеся секции|Panneaux ouvrants|پنل‌های بازشو|Paneles practicables
stockNote|تُجمع الأعواد حسب المادة ونوع القطاع. تُحسب سماحية المنشار لكل قطع. لا يُعاد استخدام المتبقي بين المشاريع.|Çubuklar malzeme ve profil türüne göre gruplandırılır. Her kesim için testere payı ayrılır. Artan parçalar projeler arasında yeniden kullanılmaz.|Заготовки сгруппированы по материалу и типу профиля. Пропил учитывается для каждого реза. Остатки не используются в других проектах.|Les barres sont regroupées par matériau et type de profilé. Le trait de scie est prévu pour chaque coupe. Les chutes ne sont pas réutilisées entre projets.|شاخه‌ها بر اساس جنس و نوع پروفیل گروه‌بندی می‌شوند. برای هر برش، عرض تیغه منظور می‌شود. باقی‌مانده‌ها بین پروژه‌ها دوباره استفاده نمی‌شوند.|Las barras se agrupan por material y tipo de perfil. Se reserva el ancho de sierra en cada corte. Los retales no se reutilizan entre proyectos.
noNotes|لا توجد ملاحظات إضافية.|Ek not yok.|Дополнительных примечаний нет.|Aucune note supplémentaire.|یادداشت دیگری وجود ندارد.|Sin notas adicionales.
view|عرض|Görüntüle|Просмотр|Voir|مشاهده|Ver
profileColor|لون القطاع|Profil rengi|Цвет профиля|Couleur du profilé|رنگ پروفیل|Color del perfil
estimate|التقدير|Tahmin|Оценка|Estimation|برآورد|Estimación
itemSettings|إعدادات العنصر|Ürün ayarları|Настройки изделия|Paramètres de l’élément|تنظیمات مورد|Ajustes del elemento
quoteNumber|عرض السعر|Teklif|Смета|Devis|پیش‌فاکتور|Presupuesto
empty|لا يوجد شيء هنا بعد|Henüz burada bir şey yok|Здесь пока пусто|Rien pour le moment|هنوز چیزی اینجا نیست|Todavía no hay nada
hardwareLabel|مجموعات الإكسسوارات|Donanım setleri|Комплекты фурнитуры|Jeux de quincaillerie|ست‌های یراق‌آلات|Juegos de herrajes
m|م|m|м|m|متر|m
m2|م²|m²|м²|m²|مترمربع|m²
`;

const dictionaries = { en, ar: {}, tr: {}, ru: {}, fr: {}, fa: {}, es: {} };
const translatedLanguages = languages.slice(1);
for (const row of phrases.trim().split("\n")) {
  const [key, ...values] = row.split("|");
  if (
    !(key in en) ||
    values.length !== translatedLanguages.length ||
    values.some((value) => !value.trim())
  ) {
    throw new Error(`Invalid translation row: ${key}`);
  }
  translatedLanguages.forEach(({ code }, index) => {
    if (Object.hasOwn(dictionaries[code], key))
      throw new Error(`Duplicate translation: ${code}.${key}`);
    dictionaries[code][key] = values[index];
  });
}

for (const { code } of translatedLanguages) {
  const missing = Object.keys(en).filter(
    (key) => !Object.hasOwn(dictionaries[code], key),
  );
  if (missing.length)
    throw new Error(`Missing ${code} translations: ${missing.join(", ")}`);
}

export function translate(lang, key) {
  return dictionaries[lang]?.[key] ?? en[key] ?? key;
}
