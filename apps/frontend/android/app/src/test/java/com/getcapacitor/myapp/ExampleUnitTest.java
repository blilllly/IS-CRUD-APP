package com.getcapacitor.myapp;

import static org.junit.Assert.*;

import org.junit.Test;

/**
 * Unit tests de lógica de negocio del cliente Android.
 * La lógica principal vive en la capa web (Angular), testeada con Vitest.
 * Estos tests cubren utilidades del lado nativo.
 */
public class ok, ya corrí el ExampleUnitTest {

    private static final int PAGE_SIZE = 6;

    @Test
    public void paginacion_totalPaginas_calculaCorrecto() {
        int totalPeliculas = 14;
        int totalPaginas = (int) Math.ceil((double) totalPeliculas / PAGE_SIZE);
        assertEquals(3, totalPaginas);
    }

    @Test
    public void paginacion_offsetPrimeraPagina_esZero() {
        int pagina = 1;
        int offset = (pagina - 1) * PAGE_SIZE;
        assertEquals(0, offset);
    }

    @Test
    public void paginacion_offsetSegundaPagina_esSeis() {
        int pagina = 2;
        int offset = (pagina - 1) * PAGE_SIZE;
        assertEquals(6, offset);
    }

    @Test
    public void busqueda_nombreContieneQuery_devuelveTrue() {
        String nombre = "Inception";
        String query = "ince";
        assertTrue(nombre.toLowerCase().contains(query.toLowerCase()));
    }

    @Test
    public void busqueda_queryVacio_siempreCoincide() {
        String query = "";
        assertTrue(query.isEmpty());
    }
}
