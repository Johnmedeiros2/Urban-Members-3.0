"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "urban_carrinho";
const EVENTO = "urban_carrinho_update";

export interface ItemCarrinho {
  produto_id: string;
  nome: string;
  preco: number;
  quantidade: number;
  vendedor_id: string;
  vendedor_nome?: string;
}

function ler(): ItemCarrinho[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ItemCarrinho[]) : [];
  } catch {
    return [];
  }
}

function escrever(itens: ItemCarrinho[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  window.dispatchEvent(new Event(EVENTO));
}

export function useCarrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    setItens(ler());
    function handler() { setItens(ler()); }
    window.addEventListener(EVENTO, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENTO, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const adicionar = useCallback((novo: Omit<ItemCarrinho, "quantidade">) => {
    const atuais = ler();
    const existente = atuais.find((i) => i.produto_id === novo.produto_id);
    if (existente) {
      existente.quantidade++;
    } else {
      atuais.push({ ...novo, quantidade: 1 });
    }
    escrever(atuais);
  }, []);

  const remover = useCallback((produto_id: string) => {
    escrever(ler().filter((i) => i.produto_id !== produto_id));
  }, []);

  const mudarQtd = useCallback((produto_id: string, qtd: number) => {
    if (qtd <= 0) { remover(produto_id); return; }
    const atuais = ler();
    const item = atuais.find((i) => i.produto_id === produto_id);
    if (item) { item.quantidade = qtd; escrever(atuais); }
  }, [remover]);

  const limpar = useCallback(() => escrever([]), []);

  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const quantidadeTotal = itens.reduce((s, i) => s + i.quantidade, 0);

  return { itens, adicionar, remover, mudarQtd, limpar, total, quantidadeTotal };
}
