PGDMP                      }            cleaning_company    17.4    17.4 l    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16683    cleaning_company    DATABASE     v   CREATE DATABASE cleaning_company WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'ru-RU';
     DROP DATABASE cleaning_company;
                     postgres    false            i           1247    16730    enum_Appointments_status    TYPE     �   CREATE TYPE public."enum_Appointments_status" AS ENUM (
    'Scheduled',
    'In Progress',
    'Completed',
    'Cancelled'
);
 -   DROP TYPE public."enum_Appointments_status";
       public               postgres    false            r           1247    16775    enum_Payments_paymentMethod    TYPE     |   CREATE TYPE public."enum_Payments_paymentMethod" AS ENUM (
    'Credit Card',
    'Debit Card',
    'PayPal',
    'Cash'
);
 0   DROP TYPE public."enum_Payments_paymentMethod";
       public               postgres    false            u           1247    16784    enum_Payments_status    TYPE     d   CREATE TYPE public."enum_Payments_status" AS ENUM (
    'Pending',
    'Completed',
    'Failed'
);
 )   DROP TYPE public."enum_Payments_status";
       public               postgres    false            �            1259    16685    Admins    TABLE     �   CREATE TABLE public."Admins" (
    id integer NOT NULL,
    login character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
    DROP TABLE public."Admins";
       public         heap r       postgres    false            �            1259    16684    Admins_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Admins_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public."Admins_id_seq";
       public               postgres    false    218            �           0    0    Admins_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public."Admins_id_seq" OWNED BY public."Admins".id;
          public               postgres    false    217            �            1259    16740    Appointments    TABLE     �  CREATE TABLE public."Appointments" (
    id integer NOT NULL,
    "appointmentDate" timestamp with time zone NOT NULL,
    status public."enum_Appointments_status" DEFAULT 'Scheduled'::public."enum_Appointments_status" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "customerId" integer NOT NULL,
    "employeeId" integer,
    "serviceId" integer NOT NULL
);
 "   DROP TABLE public."Appointments";
       public         heap r       postgres    false    873    873            �            1259    16739    Appointments_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Appointments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public."Appointments_id_seq";
       public               postgres    false    226            �           0    0    Appointments_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public."Appointments_id_seq" OWNED BY public."Appointments".id;
          public               postgres    false    225            �            1259    16696 	   Customers    TABLE     �  CREATE TABLE public."Customers" (
    id integer NOT NULL,
    login character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    "phoneNumber" character varying(255),
    address character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
    DROP TABLE public."Customers";
       public         heap r       postgres    false            �            1259    16695    Customers_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Customers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."Customers_id_seq";
       public               postgres    false    220            �           0    0    Customers_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."Customers_id_seq" OWNED BY public."Customers".id;
          public               postgres    false    219            �            1259    16707 	   Employees    TABLE     �  CREATE TABLE public."Employees" (
    id integer NOT NULL,
    login character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    "phoneNumber" character varying(255),
    address character varying(255),
    role character varying(255) DEFAULT 'Employee'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
    DROP TABLE public."Employees";
       public         heap r       postgres    false            �            1259    16706    Employees_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Employees_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."Employees_id_seq";
       public               postgres    false    222            �           0    0    Employees_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."Employees_id_seq" OWNED BY public."Employees".id;
          public               postgres    false    221            �            1259    16807 	   Feedbacks    TABLE     >  CREATE TABLE public."Feedbacks" (
    id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "appointmentId" integer NOT NULL,
    "customerId" integer NOT NULL,
    "employeeId" integer NOT NULL
);
    DROP TABLE public."Feedbacks";
       public         heap r       postgres    false            �            1259    16806    Feedbacks_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Feedbacks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."Feedbacks_id_seq";
       public               postgres    false    232            �           0    0    Feedbacks_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."Feedbacks_id_seq" OWNED BY public."Feedbacks".id;
          public               postgres    false    231            �            1259    16792    Payments    TABLE     �  CREATE TABLE public."Payments" (
    id integer NOT NULL,
    amount double precision NOT NULL,
    "paymentMethod" public."enum_Payments_paymentMethod" NOT NULL,
    status public."enum_Payments_status" DEFAULT 'Pending'::public."enum_Payments_status" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "appointmentId" integer NOT NULL
);
    DROP TABLE public."Payments";
       public         heap r       postgres    false    885    882    885            �            1259    16791    Payments_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Payments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public."Payments_id_seq";
       public               postgres    false    230            �           0    0    Payments_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public."Payments_id_seq" OWNED BY public."Payments".id;
          public               postgres    false    229            �            1259    16763 	   Schedules    TABLE     H  CREATE TABLE public."Schedules" (
    id integer NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" time without time zone NOT NULL,
    "endTime" time without time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "employeeId" integer NOT NULL
);
    DROP TABLE public."Schedules";
       public         heap r       postgres    false            �            1259    16762    Schedules_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Schedules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."Schedules_id_seq";
       public               postgres    false    228            �           0    0    Schedules_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."Schedules_id_seq" OWNED BY public."Schedules".id;
          public               postgres    false    227            �            1259    16719    Services    TABLE     H  CREATE TABLE public."Services" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price double precision NOT NULL,
    duration integer NOT NULL,
    photo character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
    DROP TABLE public."Services";
       public         heap r       postgres    false            �            1259    16718    Services_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Services_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public."Services_id_seq";
       public               postgres    false    224            �           0    0    Services_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public."Services_id_seq" OWNED BY public."Services".id;
          public               postgres    false    223            �           2604    16688 	   Admins id    DEFAULT     j   ALTER TABLE ONLY public."Admins" ALTER COLUMN id SET DEFAULT nextval('public."Admins_id_seq"'::regclass);
 :   ALTER TABLE public."Admins" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            �           2604    16743    Appointments id    DEFAULT     v   ALTER TABLE ONLY public."Appointments" ALTER COLUMN id SET DEFAULT nextval('public."Appointments_id_seq"'::regclass);
 @   ALTER TABLE public."Appointments" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225    226            �           2604    16699    Customers id    DEFAULT     p   ALTER TABLE ONLY public."Customers" ALTER COLUMN id SET DEFAULT nextval('public."Customers_id_seq"'::regclass);
 =   ALTER TABLE public."Customers" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220            �           2604    16710    Employees id    DEFAULT     p   ALTER TABLE ONLY public."Employees" ALTER COLUMN id SET DEFAULT nextval('public."Employees_id_seq"'::regclass);
 =   ALTER TABLE public."Employees" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221    222            �           2604    16810    Feedbacks id    DEFAULT     p   ALTER TABLE ONLY public."Feedbacks" ALTER COLUMN id SET DEFAULT nextval('public."Feedbacks_id_seq"'::regclass);
 =   ALTER TABLE public."Feedbacks" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    231    232            �           2604    16795    Payments id    DEFAULT     n   ALTER TABLE ONLY public."Payments" ALTER COLUMN id SET DEFAULT nextval('public."Payments_id_seq"'::regclass);
 <   ALTER TABLE public."Payments" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    229    230            �           2604    16766    Schedules id    DEFAULT     p   ALTER TABLE ONLY public."Schedules" ALTER COLUMN id SET DEFAULT nextval('public."Schedules_id_seq"'::regclass);
 =   ALTER TABLE public."Schedules" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    227    228            �           2604    16722    Services id    DEFAULT     n   ALTER TABLE ONLY public."Services" ALTER COLUMN id SET DEFAULT nextval('public."Services_id_seq"'::regclass);
 <   ALTER TABLE public."Services" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    223    224            �          0    16685    Admins 
   TABLE DATA           Q   COPY public."Admins" (id, login, password, "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    218   "�       �          0    16740    Appointments 
   TABLE DATA           �   COPY public."Appointments" (id, "appointmentDate", status, "createdAt", "updatedAt", "customerId", "employeeId", "serviceId") FROM stdin;
    public               postgres    false    226   ��       �          0    16696 	   Customers 
   TABLE DATA           �   COPY public."Customers" (id, login, password, "firstName", "lastName", "phoneNumber", address, "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    220   ��       �          0    16707 	   Employees 
   TABLE DATA           �   COPY public."Employees" (id, login, password, "firstName", "lastName", "phoneNumber", address, role, "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    222   e�       �          0    16807 	   Feedbacks 
   TABLE DATA           �   COPY public."Feedbacks" (id, rating, comment, "createdAt", "updatedAt", "appointmentId", "customerId", "employeeId") FROM stdin;
    public               postgres    false    232   9�       �          0    16792    Payments 
   TABLE DATA           t   COPY public."Payments" (id, amount, "paymentMethod", status, "createdAt", "updatedAt", "appointmentId") FROM stdin;
    public               postgres    false    230   ��       �          0    16763 	   Schedules 
   TABLE DATA           v   COPY public."Schedules" (id, "dayOfWeek", "startTime", "endTime", "createdAt", "updatedAt", "employeeId") FROM stdin;
    public               postgres    false    228   v�       �          0    16719    Services 
   TABLE DATA           m   COPY public."Services" (id, name, description, price, duration, photo, "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    224   \�       �           0    0    Admins_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public."Admins_id_seq"', 5, true);
          public               postgres    false    217            �           0    0    Appointments_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."Appointments_id_seq"', 23, true);
          public               postgres    false    225            �           0    0    Customers_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."Customers_id_seq"', 5, true);
          public               postgres    false    219            �           0    0    Employees_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."Employees_id_seq"', 3, true);
          public               postgres    false    221            �           0    0    Feedbacks_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."Feedbacks_id_seq"', 1, true);
          public               postgres    false    231            �           0    0    Payments_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."Payments_id_seq"', 23, true);
          public               postgres    false    229            �           0    0    Schedules_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public."Schedules_id_seq"', 15, true);
          public               postgres    false    227            �           0    0    Services_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public."Services_id_seq"', 9, true);
          public               postgres    false    223            �           2606    17495    Admins Admins_login_key 
   CONSTRAINT     W   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key" UNIQUE (login);
 E   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key";
       public                 postgres    false    218            �           2606    17497    Admins Admins_login_key1 
   CONSTRAINT     X   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key1" UNIQUE (login);
 F   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key1";
       public                 postgres    false    218            �           2606    17499    Admins Admins_login_key2 
   CONSTRAINT     X   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key2" UNIQUE (login);
 F   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key2";
       public                 postgres    false    218            �           2606    17501    Admins Admins_login_key3 
   CONSTRAINT     X   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key3" UNIQUE (login);
 F   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key3";
       public                 postgres    false    218            �           2606    17503    Admins Admins_login_key4 
   CONSTRAINT     X   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key4" UNIQUE (login);
 F   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key4";
       public                 postgres    false    218            �           2606    17505    Admins Admins_login_key5 
   CONSTRAINT     X   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key5" UNIQUE (login);
 F   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key5";
       public                 postgres    false    218            �           2606    17493    Admins Admins_login_key6 
   CONSTRAINT     X   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key6" UNIQUE (login);
 F   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key6";
       public                 postgres    false    218            �           2606    17507    Admins Admins_login_key7 
   CONSTRAINT     X   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key7" UNIQUE (login);
 F   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key7";
       public                 postgres    false    218            �           2606    17509    Admins Admins_login_key8 
   CONSTRAINT     X   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_login_key8" UNIQUE (login);
 F   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_login_key8";
       public                 postgres    false    218            �           2606    16692    Admins Admins_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_pkey" PRIMARY KEY (id);
 @   ALTER TABLE ONLY public."Admins" DROP CONSTRAINT "Admins_pkey";
       public                 postgres    false    218            �           2606    16746    Appointments Appointments_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."Appointments"
    ADD CONSTRAINT "Appointments_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."Appointments" DROP CONSTRAINT "Appointments_pkey";
       public                 postgres    false    226            �           2606    17515    Customers Customers_login_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key" UNIQUE (login);
 K   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key";
       public                 postgres    false    220            �           2606    17517    Customers Customers_login_key1 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key1" UNIQUE (login);
 L   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key1";
       public                 postgres    false    220            �           2606    17519    Customers Customers_login_key2 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key2" UNIQUE (login);
 L   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key2";
       public                 postgres    false    220            �           2606    17521    Customers Customers_login_key3 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key3" UNIQUE (login);
 L   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key3";
       public                 postgres    false    220            �           2606    17523    Customers Customers_login_key4 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key4" UNIQUE (login);
 L   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key4";
       public                 postgres    false    220            �           2606    17525    Customers Customers_login_key5 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key5" UNIQUE (login);
 L   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key5";
       public                 postgres    false    220            �           2606    17513    Customers Customers_login_key6 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key6" UNIQUE (login);
 L   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key6";
       public                 postgres    false    220            �           2606    17527    Customers Customers_login_key7 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key7" UNIQUE (login);
 L   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key7";
       public                 postgres    false    220            �           2606    17529    Customers Customers_login_key8 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_login_key8" UNIQUE (login);
 L   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_login_key8";
       public                 postgres    false    220            �           2606    16703    Customers Customers_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."Customers" DROP CONSTRAINT "Customers_pkey";
       public                 postgres    false    220            �           2606    17535    Employees Employees_login_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key" UNIQUE (login);
 K   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key";
       public                 postgres    false    222            �           2606    17537    Employees Employees_login_key1 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key1" UNIQUE (login);
 L   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key1";
       public                 postgres    false    222            �           2606    17539    Employees Employees_login_key2 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key2" UNIQUE (login);
 L   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key2";
       public                 postgres    false    222            �           2606    17541    Employees Employees_login_key3 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key3" UNIQUE (login);
 L   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key3";
       public                 postgres    false    222            �           2606    17543    Employees Employees_login_key4 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key4" UNIQUE (login);
 L   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key4";
       public                 postgres    false    222            �           2606    17545    Employees Employees_login_key5 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key5" UNIQUE (login);
 L   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key5";
       public                 postgres    false    222            �           2606    17533    Employees Employees_login_key6 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key6" UNIQUE (login);
 L   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key6";
       public                 postgres    false    222            �           2606    17547    Employees Employees_login_key7 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key7" UNIQUE (login);
 L   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key7";
       public                 postgres    false    222            �           2606    17549    Employees Employees_login_key8 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_login_key8" UNIQUE (login);
 L   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_login_key8";
       public                 postgres    false    222            �           2606    16715    Employees Employees_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Employees"
    ADD CONSTRAINT "Employees_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."Employees" DROP CONSTRAINT "Employees_pkey";
       public                 postgres    false    222            �           2606    16814    Feedbacks Feedbacks_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Feedbacks"
    ADD CONSTRAINT "Feedbacks_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."Feedbacks" DROP CONSTRAINT "Feedbacks_pkey";
       public                 postgres    false    232            �           2606    16800 #   Payments Payments_appointmentId_key 
   CONSTRAINT     m   ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_appointmentId_key" UNIQUE ("appointmentId");
 Q   ALTER TABLE ONLY public."Payments" DROP CONSTRAINT "Payments_appointmentId_key";
       public                 postgres    false    230            �           2606    16798    Payments Payments_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."Payments" DROP CONSTRAINT "Payments_pkey";
       public                 postgres    false    230            �           2606    16768    Schedules Schedules_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."Schedules" DROP CONSTRAINT "Schedules_pkey";
       public                 postgres    false    228            �           2606    17559    Services Services_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key" UNIQUE (name);
 H   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key";
       public                 postgres    false    224            �           2606    17561    Services Services_name_key1 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key1" UNIQUE (name);
 I   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key1";
       public                 postgres    false    224            �           2606    17563    Services Services_name_key2 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key2" UNIQUE (name);
 I   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key2";
       public                 postgres    false    224            �           2606    17565    Services Services_name_key3 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key3" UNIQUE (name);
 I   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key3";
       public                 postgres    false    224            �           2606    17567    Services Services_name_key4 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key4" UNIQUE (name);
 I   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key4";
       public                 postgres    false    224            �           2606    17569    Services Services_name_key5 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key5" UNIQUE (name);
 I   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key5";
       public                 postgres    false    224            �           2606    17557    Services Services_name_key6 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key6" UNIQUE (name);
 I   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key6";
       public                 postgres    false    224            �           2606    17571    Services Services_name_key7 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key7" UNIQUE (name);
 I   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key7";
       public                 postgres    false    224            �           2606    17555    Services Services_name_key8 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_name_key8" UNIQUE (name);
 I   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_name_key8";
       public                 postgres    false    224            �           2606    16726    Services Services_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."Services" DROP CONSTRAINT "Services_pkey";
       public                 postgres    false    224            �           2606    17574 )   Appointments Appointments_customerId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Appointments"
    ADD CONSTRAINT "Appointments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customers"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 W   ALTER TABLE ONLY public."Appointments" DROP CONSTRAINT "Appointments_customerId_fkey";
       public               postgres    false    4789    220    226            �           2606    17579 )   Appointments Appointments_employeeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Appointments"
    ADD CONSTRAINT "Appointments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employees"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 W   ALTER TABLE ONLY public."Appointments" DROP CONSTRAINT "Appointments_employeeId_fkey";
       public               postgres    false    4809    226    222            �           2606    17584 (   Appointments Appointments_serviceId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Appointments"
    ADD CONSTRAINT "Appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Services"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 V   ALTER TABLE ONLY public."Appointments" DROP CONSTRAINT "Appointments_serviceId_fkey";
       public               postgres    false    226    4829    224            �           2606    17601 &   Feedbacks Feedbacks_appointmentId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Feedbacks"
    ADD CONSTRAINT "Feedbacks_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointments"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 T   ALTER TABLE ONLY public."Feedbacks" DROP CONSTRAINT "Feedbacks_appointmentId_fkey";
       public               postgres    false    4831    232    226            �           2606    17606 #   Feedbacks Feedbacks_customerId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Feedbacks"
    ADD CONSTRAINT "Feedbacks_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customers"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public."Feedbacks" DROP CONSTRAINT "Feedbacks_customerId_fkey";
       public               postgres    false    232    220    4789            �           2606    17611 #   Feedbacks Feedbacks_employeeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Feedbacks"
    ADD CONSTRAINT "Feedbacks_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employees"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public."Feedbacks" DROP CONSTRAINT "Feedbacks_employeeId_fkey";
       public               postgres    false    232    4809    222            �           2606    17596 $   Payments Payments_appointmentId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointments"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 R   ALTER TABLE ONLY public."Payments" DROP CONSTRAINT "Payments_appointmentId_fkey";
       public               postgres    false    230    226    4831            �           2606    17589 #   Schedules Schedules_employeeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employees"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public."Schedules" DROP CONSTRAINT "Schedules_employeeId_fkey";
       public               postgres    false    4809    222    228            �   |  x�}��r�@ ��<Eަ��F�SP�B\��U�����bؔy�9�bk�����(�/J������M2�Q�1v���b���mba&��=D��ΝSg�i����P��'bj���h�0���G,? � ��	 ����$�\?O��mT���**�m3���8;��>����׋�\�s�lZ2�ܿN�1��t `�*"V(����{�`�o���e׻j��ڟ2�I�!��h��Z�zU��l� �@~ޗ��	Q ���q  7@���Q��yU�O3]?���j?�S�d��Ꝋ}����pv�VT�y!�X��J ��m��~��o����l��Ӣ�է˶���j�.��U���@���ϋȀŻ��$�A�̬�      �   :  x��V�n1�W_�>XB�H��Ti� i�Ň�pb�N�?�J��=Y\7�>�Թ�,�ly��>[��O�M���<�{�<5��)5z�1���N��}�H�����_A%�7�q�]8�e���������^����ė,�K����'�R(�?��^~�]��o�$���/���b���*��aRF��Cĕ��ʝ��q/�#��'��<ޔyl��%�O}�Z� 6R�ڌ2P�C@���\�'�
�ōtG@��1���A�ϠVP�d(�2��8B�Zt�P�Hw�8vv�[i�-
����ԉ>t��T�=�t!��Mu�;��;9Cx�P�UƏ�1�Ћ������4�rJ��;�C+���7�P@7��soGHڌe#�:cʕ��U�XM3v����ئf"��������T��(��OUB��K�{�ls�a	���b�j|�E���"4x�GʤNH�����ԙ��>��M��T�F��6�'0�ڤS����i|n�e��A�^	jC=7������l0���l ץ���?�)n1�#c�B��      �   ]  x���OO�0��Χ�"�v��9X[(MC))-�4�I��MhI���JOH�v�v�&�o�ؐC��o4w���ˢ(r��'=�^C��q�j��ݣ, g*�G+$G�����f�Ya�SHz-Z�(�|d7ݸ�˪nR�6����� q�0C���x=/�� �%/!��؀�A�R���Dn;��m/���1'�}wG��u/w2Zٮ�h�f�v7]��$��6���jVmk��<��O~���k~˯�1�_�	�H��w�,b� Ft�UU����ʯā+~�����FL���{1u'~�Ep�N2*�c�2P3d@,kD"�,�� �	.QX�T��Z�>d0������ڞY4Yu��Rsh�뚛e�A9���xP;�3�'Z俴��"����\$��Zx�lx:ީ�W�]��X	�}�D^WvS�e��li{E��+9�e���]�k�;u�wb�m^!D����O'�;����_��D�Bd(LV~.1I����c=�m��^Z��n���F�7c;p
k۞[Uև�[e�ndV,w��|�Dqr=V��i#��L�;(Ѕ�X�8�<#�Ld���s��F�$�b"_g      �   �  x����n�@���)rȭ��]�}���		��������l�QB>�����=p,�� � �����
�oĺ��*�J���h��O��{�)cO_r6ƨL�2��[��ƐG~�2�Ӟ�°:i���hذv���uj�"K�p-������\���/��u)^�c�Вn��1m���������B�wq(!+fJp%�s����L��?�ш�����)a�5,WsT�0�4�-�,���؞j���v���fO��{�j�oֺZ�A���Ui�k�k���u�L��
��C�|���p&f�~����Sєu,gs�J�V^��.�	z��H���m��T��q���=���<�����7�v�f�|�����v��Su�ۏ��J/5XK����`�i<�h�#5D��x��Υ3��|e����&����������]ˣ�ATJq�{�*���v	�      �   R   x�3�4�0�bӅ�v\l�����
.l����>����<N##S]c]#KC3+3+C=Smc�R@h����� ��!;      �   �  x����n�@E�]_�=J���0�f�X)���)�Bc3��W}|�u��Q8_��/��<�\�^�!I����8w��KL�Hߓbh9�^�������z=��+5��"��BcDIزO�I	$0퉧�?~=Oo���6R�╝zbd.�%�!���`*� �R������~�����Eݤ
L!S�<}��[�X4�����Ai�^����=s'1���aRl���Nb�s�H�RP�!n��eԤ�hյ�"o�v����U0���J��<�Nڞ���ƽ�Cĵk�֜�K"A�P͵��5{5�$�e6�mG1Wg�����]�Q>�()ccǝ�<�u"	򜱛FN�m��Ș��mkHc1f�ly�Ƙv�M��c�
�?��2�����	��ldk�Q��~��pcF�ͤ�	��h���[�j�+�KNr��9�C��GŘ���O�ײ|A ��p��      �   �   x���Aj�0��)�/_�I�e�,��9���~��00H�jA�>E�W�K��mj�j�F������U�^Sۉ@�����Ej;(J-�C���S:G��@���l>���N{�q��'�;[dD�=Ý�M	ְD� ��:���.��[��*���-�`%�(a���"��
�n����vY�-� �6���1U9BS���/=��      �   �	  x��Y�n��}����3���E�(�W�R�E��h���ݖl'�<V'��� m&(��ҺX�,ѿ@�B��{�}H�"ig��1�s�>������8��c��k����һ4N�i��d��߅����4��]u�d�>=��4�&/����GKd	D��ޒǇ49�l�ݔ�g3+}�i2j��y����9�~!�@��ѳ���d���q7�<��Q��~+��ӭ�<@��!���y��)0��e#����^%)�4 ��˓N��Ly�D�,[�)k��������έ�[1�7K���RUƀ�綱��%~�ʵ�Z��4���罕މ�� X6�[i�A��Q��_[�y�%��,1��h��xN���{��fsJ��؈��8�����B,�ےgtXkP��d�8�,�#���o��W�5-]�|�mdX6���@��"���E0h���=����3�L�b:�I��[� �	t������.���?��E�4�"
~cI�At+l{���%ᙵir�����pǥ�[�Q"y��3�}�>h^¡3E�|N��Ӱ{Z�o�ԗP��gmj|H��Nɮ�dG�K
�q�P,�gc�\9��Go��WƧ�-wL2@Q�CD�znrޥj�-��--�]`����W+�3��9 Pޠ����	��9��(�Q!��yK/`��[r�v��1)=�?2�U��3�C��s~f�|�
�>p	1�E�o�*��"/�|2��]!�[�(9R����{��i~�y{��� "rn��*�[3ㄡa�Vf���B��ݐ�����{
`^6;g�޷Tբ��v�����q�V��ꢣ�	�;t������jVqo#k<�����D��6����3���0X��`k��M,��˛>�+�U��۝��|��׿��_}���߾��U�=�wG��N8�Co4��{���k�~�����r���Mlw���/l��I�Bh�
����aH~ِ6�H;�r/������;�5��Y��JW�)9�A���)
li8G��XR�����RZ��N���"�Ƕ;�����¡�w}�	��g79t8q��858�4��:�`Da��/2}�1}�I�s���X��%:/8 4'�r�h\�s/]V���?�����ʨ.8E��b
�n����	�?g�+T�yL�5J������Yl��u"�E��y�ͯIBm�K�xa�@b\� $D�e���ƥ|�RY������\���~	�´:��E����ua�`�k&�V���Pt�j,	2�5���A�f����-M��uʆHk)���H�2k���no�� ��[$A��=��AC��=4��h�#�雉E��[�\��0��1Zs�q)6VZyEƞ`�y����
@_�e���o�wZ�A���&D�{P�K�E|!|Φ�޴������s����S�;7NG��`��+-���2�2�am0�F�)��
��Q��R�8cs� �4s�qi4��θ�5ǁ7����N�<a�_�h3��� ���Y�YcD�k�K%M�,�>��D�l�4,Jq��ceL���	�~�]�:_��Ѐ��g��T��p�T�U,D��i2�,Qϡh^L��8'�d�ROG,_l@�.�M-ƃ��u��+��V�Ϝ��H��K��O��Tr��^s��[��A��!���{����g�{��X��Aѐ�]IǢ�6�AT�6��fvb��d��FU��<Iɩǫ�s�"��/R(V�?�i����|�%���Ѭ�l��9?j#���a�	�[q��$��n�H���ܑ���{`E�R�h�j��3�r�k8� N� ����;F�A��L�ͫ����V��R?�Gbӧr��"��p)�n��f�0#(r{�#��H��Sjq��FLf�0@2>F���<2y���/NǦ]�B�߲[-�zdo���Ef\0����l*�@���@�r�|��{�7�g�#�w�^:�4�n�G�����^O�N��^��*���S��u$Ϛ��=��E��BB�+PԺUϪ��ϗϠ[[�RI����F�V�ک_(�ƆKI k�*/�N�(I�V������=�j�Ӏ;l�m��;^(��%t�����s��oqi���xi�X �L��ʼf�t0�:�!�47ks���.;�_�Nk�²!�����h��b�F�--f*ZN���!�����O�5kjP]*��8T[�����=��2��9ߵ�)BMM�i�Q����2�)=J%�Xt�A�	ۀ�خ�����='�}�H��u��6 �4��r}~�k��i�<��+k��ȋK�!ꁒ ^5��*o��>'o�#ddă�+�!�Y?B��Ǯ8�3l:X�'�������P7<1��)��FMs|�;~������%/�&L���k61M��^��sϟV�h��n��7��Ñ�z�0K����w��n,���vmI9�I<2MG�8!��L���q�g��[*�;��TI_�������0� k��u_���Y���     