---
title: Dual-Pivot-Quick-Sort
tags:

---

> 快速排序的一个具体实现，即JDK1.7版本引入的双枢纽快速排序(Dual-Pivot-Quick-Sort)，它是Arrays.sort()对基础数据类型(primitive)使用的排序算法。

## 双枢纽快速排序(Dual-Pivot-Quick-Sort)
首先需要声明的是，这篇文章只是简单描述其主要排序流程或者说翻译源码的注释部分，主要原因是我目前的编程水平不足以解释每句代码，其次还因为该实现中有一些做法是基于经验与实践，无从解释。
在进入冗长的代码之前，先来补充一些谈资。
- JDK(1.8)Arrays.sort()主要由三个版本的排序方法组成，原始数据类型(Primitive)调用快速排序的优化版本(DualPivotQuickSort)，引用数据类型(Reference)默认调用归并排序的优化版本(TimSort)，也可以通过虚拟机选项来设置其调用老版本的归并排序(lagacyMergeSort)。
- DualPivotQuickSort的主要作者是Vladimir Yaroslavskiy，于2009年发布第一个版本，可以参考这篇文章[DualPivotQuicksort](http://codeblab.com/wp-content/uploads/2009/09/DualPivotQuicksort.pdf)。
- 另外两个作者分别是[Jon Bentley](https://en.wikipedia.org/wiki/Jon_Bentley)与[Joshua Bloch](https://en.wikipedia.org/wiki/Joshua_Bloch)，前面的三向切分优化也出自于[Jon Bentley](https://en.wikipedia.org/wiki/Jon_Bentley)，同时他还是[James Gosling](https://en.wikipedia.org/wiki/James_Gosling)和[Joshua Bloch](https://en.wikipedia.org/wiki/Joshua_Bloch)的导师。
- DualPivotQuicksort这个类对每种原始数据类型实现了一个排序版本，所以不用被其代码量吓到，因为其中大量逻辑是重复的，这里只看int部分。

下面开始来到入口点，不得不说即便无视大量重复逻辑，该方法代码量还是挺大的，我会尽可能去掉一些与本文无关的部分。
```java
        // 先检测数组长度，如果小于286，则直接进入快速排序
        if (right - left < QUICKSORT_THRESHOLD) {
            sort(a, left, right, true);
            return;
        }

		...

        // 检测数组是否接近有序
        for(int k = left; k < right; run[count] = k){
			...
        }

        // 如果数组比较无序，进入快速排序
        if (++count == MAX_RUN_COUNT) {
            sort(a, left, right, true);
            return;
        }

        //否则使用归并排序
        ...
```
下面才正式进入快速排序的递归调用部分
```java
private static void sort(int[] a, int left, int right, boolean leftmost) {
        int length = right - left + 1;

        // 对微型数组使用插入排序，这里的INSERTION_SORT_THRESHOLD = 47
        if (length < INSERTION_SORT_THRESHOLD) {
            if (leftmost) {
                /*
                 * 如果当前的left索引在数组的最左端，使用传统的插入排序
                 */
                for (int i = left, j = i; i < right; j = ++i) {
					...
                }
            } else {
            	/*
                * 使用插入排序的优化版本，源码中称其为"pair insertion sort"
                * 在快速排序的上下文中比传统的插入排序更高效
                */
            	...
            }
        }

        // 简直“丧心病狂”，下面这行代码低消耗的计算length / 7的近似值，我表示懵B
        int seventh = (length >> 3) + (length >> 6) + 1;

         /*
         * Sort five evenly spaced elements around (and including) the
         * center element in the range. These elements will be used for
         * pivot selection as described below. The choice for spacing
         * these elements was empirically determined to work well on
         * a wide variety of inputs.
         */
        int e3 = (left + right) >>> 1; // midpoint 即排序段的中间索引
        int e2 = e3 - seventh;
        int e1 = e2 - seventh;
        int e4 = e3 + seventh;
        int e5 = e4 + seventh;

        // 对这5个点进行插入排序
        ...

        // Pointers
        int less  = left;  // The index of the first element of center part
        int great = right; // The index before the first element of right part

        //检测这5个点互不相等
        if (a[e1] != a[e2] && a[e2] != a[e3] && a[e3] != a[e4] && a[e4] != a[e5]) {
            /*
             * 使用e2与e4作为枢纽(pivot),注意这里e2比e4小
             */
            int pivot1 = a[e2];
            int pivot2 = a[e4];

            /*
             * The first and the last elements to be sorted are moved to the
             * locations formerly occupied by the pivots. When partitioning
             * is complete, the pivots are swapped back into their final
             * positions, and excluded from subsequent sorting.
             */
            a[e2] = a[left];
            a[e4] = a[right];

            /*
             * 跳过数组两端小于或大于pivot的元素
             */
            while (a[++less] < pivot1);
            while (a[--great] > pivot2);

            /*
             * Partitioning:
             *
             *   left part           center part                   right part
             * +--------------------------------------------------------------+
             * |  < pivot1  |  pivot1 <= && <= pivot2  |    ?    |  > pivot2  |
             * +--------------------------------------------------------------+
             *               ^                          ^       ^
             *               |                          |       |
             *              less                        k     great
             *
             * Invariants:
             *
             *              all in (left, less)   < pivot1
             *    pivot1 <= all in [less, k)     <= pivot2
             *              all in (great, right) > pivot2
             *
             * Pointer k is the first index of ?-part.
             */
            outer:
            for (int k = less - 1; ++k <= great; ) {
                int ak = a[k];
                if (ak < pivot1) { // Move a[k] to left part
                    a[k] = a[less];
                    /*
                     * Here and below we use "a[i] = b; i++;" instead
                     * of "a[i++] = b;" due to performance issue.
                     */
                    a[less] = ak;
                    ++less;
                } else if (ak > pivot2) { // Move a[k] to right part
                    while (a[great] > pivot2) {
                        if (great-- == k) {
                            break outer;
                        }
                    }
                    if (a[great] < pivot1) { // a[great] <= pivot2
                        a[k] = a[less];
                        a[less] = a[great];
                        ++less;
                    } else { // pivot1 <= a[great] <= pivot2
                        a[k] = a[great];
                    }
                    /*
                     * Here and below we use "a[i] = b; i--;" instead
                     * of "a[i--] = b;" due to performance issue.
                     */
                    a[great] = ak;
                    --great;
                }
            }

            // Swap pivots into their final positions
            a[left]  = a[less  - 1]; a[less  - 1] = pivot1;
            a[right] = a[great + 1]; a[great + 1] = pivot2;

            // Sort left and right parts recursively, excluding known pivots
            sort(a, left, less - 2, leftmost);
            sort(a, great + 2, right, false);

            /*
             * If center part is too large (comprises > 4/7 of the array),
             * swap internal pivot values to ends.
             */
            if (less < e1 && e5 < great) {
                /*
                 * Skip elements, which are equal to pivot values.
                 */
                while (a[less] == pivot1) {
                    ++less;
                }

                while (a[great] == pivot2) {
                    --great;
                }

                /*
                 * Partitioning:
                 *
                 *   left part         center part                  right part
                 * +----------------------------------------------------------+
                 * | == pivot1 |  pivot1 < && < pivot2  |    ?    | == pivot2 |
                 * +----------------------------------------------------------+
                 *              ^                        ^       ^
                 *              |                        |       |
                 *             less                      k     great
                 *
                 * Invariants:
                 *
                 *              all in (*,  less) == pivot1
                 *     pivot1 < all in [less,  k)  < pivot2
                 *              all in (great, *) == pivot2
                 *
                 * Pointer k is the first index of ?-part.
                 */
                outer:
                for (int k = less - 1; ++k <= great; ) {
                    int ak = a[k];
                    if (ak == pivot1) { // Move a[k] to left part
                        a[k] = a[less];
                        a[less] = ak;
                        ++less;
                    } else if (ak == pivot2) { // Move a[k] to right part
                        while (a[great] == pivot2) {
                            if (great-- == k) {
                                break outer;
                            }
                        }
                        if (a[great] == pivot1) { // a[great] < pivot2
                            a[k] = a[less];
                            /*
                             * Even though a[great] equals to pivot1, the
                             * assignment a[less] = pivot1 may be incorrect,
                             * if a[great] and pivot1 are floating-point zeros
                             * of different signs. Therefore in float and
                             * double sorting methods we have to use more
                             * accurate assignment a[less] = a[great].
                             */
                            a[less] = pivot1;
                            ++less;
                        } else { // pivot1 < a[great] < pivot2
                            a[k] = a[great];
                        }
                        a[great] = ak;
                        --great;
                    }
                }
            }

            // Sort center part recursively
            sort(a, less, great, false);

        } else { // Partitioning with one pivot
            /*
             * Use the third of the five sorted elements as pivot.
             * This value is inexpensive approximation of the median.
             */
            int pivot = a[e3];

            /*
             * Partitioning degenerates to the traditional 3-way
             * (or "Dutch National Flag") schema:
             *
             *   left part    center part              right part
             * +-------------------------------------------------+
             * |  < pivot  |   == pivot   |     ?    |  > pivot  |
             * +-------------------------------------------------+
             *              ^              ^        ^
             *              |              |        |
             *             less            k      great
             *
             * Invariants:
             *
             *   all in (left, less)   < pivot
             *   all in [less, k)     == pivot
             *   all in (great, right) > pivot
             *
             * Pointer k is the first index of ?-part.
             */
            for (int k = less; k <= great; ++k) {
                if (a[k] == pivot) {
                    continue;
                }
                int ak = a[k];
                if (ak < pivot) { // Move a[k] to left part
                    a[k] = a[less];
                    a[less] = ak;
                    ++less;
                } else { // a[k] > pivot - Move a[k] to right part
                    while (a[great] > pivot) {
                        --great;
                    }
                    if (a[great] < pivot) { // a[great] <= pivot
                        a[k] = a[less];
                        a[less] = a[great];
                        ++less;
                    } else { // a[great] == pivot
                        /*
                         * Even though a[great] equals to pivot, the
                         * assignment a[k] = pivot may be incorrect,
                         * if a[great] and pivot are floating-point
                         * zeros of different signs. Therefore in float
                         * and double sorting methods we have to use
                         * more accurate assignment a[k] = a[great].
                         */
                        a[k] = pivot;
                    }
                    a[great] = ak;
                    --great;
                }
            }

            /*
             * Sort left and right parts recursively.
             * All elements from center part are equal
             * and, therefore, already sorted.
             */
            sort(a, left, less - 1, leftmost);
            sort(a, great + 1, right, false);
        }
    }
```
- [DualPivotQuicksort](http://codeblab.com/wp-content/uploads/2009/09/DualPivotQuicksort.pdf)