import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from "../models/product";
import {Constants} from "../constants/constants";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) {
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(Constants.BASE_URL + '/list');
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${Constants.BASE_URL}/${id}`);
  }

  getProductByName(name: string): Observable<Product[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Product[]>(`${Constants.BASE_URL}/filter`, {params});
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(Constants.BASE_URL, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${Constants.BASE_URL}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${Constants.BASE_URL}/${id}`);
  }
}
