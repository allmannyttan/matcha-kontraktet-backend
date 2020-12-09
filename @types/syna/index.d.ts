declare module syna {
  export interface Namn {
    tilltal: string
    _t: string
  }

  export interface Namnlista {
    Namn: Namn
    Mellannamn: string
    Efternamn: string
    Fornamn: string
  }

  export interface Lan {
    kod: string
    _t: string
  }

  export interface Kommun {
    kod: string
    _t: string
  }

  export interface Forsamling {
    kod: string
    _t: string
  }

  export interface Landsdel {
    kod: string
    _t: string
  }

  export interface Landskap {
    kod: string
    _t: string
  }

  export interface Distrikt {
    kod: string
    _t: string
  }

  export interface Adress {
    typ: string
    not: string
    Coadress: any
    Fortsadress: string
    Gatabox: string
    Postnr: any
    Postort: any
    Land: any
    Lan: Lan
    Kommun: Kommun
    Forsamling: Forsamling
    Landsdel: Landsdel
    Landskap: Landskap
    Distrikt: Distrikt
  }

  export interface Adresslista {
    Adress: Adress[]
  }

  export interface Omfragad {
    id: string
    not: string
    fbfdatum: string
    sekel: string
    Namnlista: Namnlista
    Adresslista: Adresslista
  }

  export interface Objekt {
    Omfragad: Omfragad
  }

  export interface Objektlista {
    antal: number
    Objekt: Objekt[]
  }

  export interface Msg {
    id: string
    sev: string
    runid: string
    _t: string
  }

  export interface SynaError {
    Msg: Msg
  }

  export interface Svar {
    Objektlista?: Objektlista
    Error?: SynaError
  }

  export interface RootObject {
    Svar: Svar
  }
}
